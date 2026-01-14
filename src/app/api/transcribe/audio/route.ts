import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkCredits, deductCredits, CREDIT_COSTS } from "@/lib/credits";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { audioData, language = "auto", includeTimestamps = false, speakerDiarization = false } = await request.json();

    if (!audioData) {
      return NextResponse.json({ error: "Audio data is required" }, { status: 400 });
    }

    // Check credits before processing (estimate 1 minute minimum)
    const creditCheck = await checkCredits(session.user.id, CREDIT_COSTS["audio-transcribe"]);
    if (!creditCheck.hasEnoughCredits) {
      return NextResponse.json(
        { error: "Insufficient credits", required: CREDIT_COSTS["audio-transcribe"], current: creditCheck.currentCredits },
        { status: 402 }
      );
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google AI API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Use Gemini 2.0 Flash for audio transcription
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    // Extract base64 data and mime type
    const matches = audioData.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: "Invalid audio data format" },
        { status: 400 }
      );
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Build transcription prompt
    let transcriptionPrompt = "Transcribe this audio accurately.";

    if (language !== "auto") {
      transcriptionPrompt += ` The audio is in ${language}.`;
    }

    if (includeTimestamps) {
      transcriptionPrompt += " Include timestamps for each segment in the format [MM:SS].";
    }

    if (speakerDiarization) {
      transcriptionPrompt += " Identify and label different speakers (Speaker 1, Speaker 2, etc.) if there are multiple speakers.";
    }

    transcriptionPrompt += " Provide only the transcription text without any additional commentary.";

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          { text: transcriptionPrompt },
        ],
      }],
      generationConfig: {
        temperature: 0.1, // Low temperature for accurate transcription
        maxOutputTokens: 8192,
      },
    });

    const response = result.response;
    const transcription = response.text();

    // Estimate duration based on transcription length (rough estimate)
    const wordCount = transcription.split(/\s+/).length;
    const estimatedDurationMinutes = Math.max(1, Math.ceil(wordCount / 150)); // ~150 words per minute average

    // Calculate credits based on estimated duration
    const creditsUsed = estimatedDurationMinutes * CREDIT_COSTS["audio-transcribe"];

    // Deduct credits after successful transcription
    const deductResult = await deductCredits(
      session.user.id,
      creditsUsed,
      "audio-transcription",
      `Transcribed ~${estimatedDurationMinutes} min audio`
    );

    if (!deductResult.success && !deductResult.isAdmin) {
      console.error("Failed to deduct credits:", deductResult.error);
    }

    return NextResponse.json({
      transcription,
      language: language === "auto" ? "detected" : language,
      wordCount,
      estimatedDuration: `~${estimatedDurationMinutes} min`,
      creditsUsed,
      newBalance: deductResult.newBalance,
    });
  } catch (error) {
    console.error("Audio transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio", details: String(error) },
      { status: 500 }
    );
  }
}
