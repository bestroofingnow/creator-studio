import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { audioData, language = "auto", includeTimestamps = false, speakerDiarization = false } = await request.json();

    if (!audioData) {
      return NextResponse.json({ error: "Audio data is required" }, { status: 400 });
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
    const estimatedDurationMinutes = Math.ceil(wordCount / 150); // ~150 words per minute average

    return NextResponse.json({
      transcription,
      language: language === "auto" ? "detected" : language,
      wordCount,
      estimatedDuration: `~${estimatedDurationMinutes} min`,
      creditsUsed: Math.ceil(
        ((response.usageMetadata?.promptTokenCount || 0) * 0.01) +
        ((response.usageMetadata?.candidatesTokenCount || 0) * 0.03)
      ),
    });
  } catch (error) {
    console.error("Audio transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio", details: String(error) },
      { status: 500 }
    );
  }
}
