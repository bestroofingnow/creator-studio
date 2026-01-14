import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkCredits, deductCredits, CREDIT_COSTS } from "@/lib/credits";

export const maxDuration = 60; // 1 minute for speech generation

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, voice = "Kore", speed = 1.0, pitch = 0 } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: "Text is too long. Maximum 5000 characters." }, { status: 400 });
    }

    // Calculate credits based on text length (per 1K characters)
    const requiredCredits = Math.ceil((text.length / 1000) * CREDIT_COSTS["speech-generate"]);

    // Check credits before processing
    const creditCheck = await checkCredits(session.user.id, requiredCredits);
    if (!creditCheck.hasEnoughCredits) {
      return NextResponse.json(
        { error: "Insufficient credits", required: requiredCredits, current: creditCheck.currentCredits },
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

    // Try using Gemini 2.5 Flash with audio output
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-preview-tts",
      });

      const result = await model.generateContent({
        contents: [{
          role: "user",
          parts: [{ text: `Read this text aloud with natural speech: "${text}"` }],
        }],
        generationConfig: {
          // @ts-expect-error - TTS specific config
          responseModalities: ["audio"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice,
              },
            },
          },
        },
      });

      const response = result.response;

      // Extract audio data from response
      if (response.candidates && response.candidates[0]) {
        const parts = response.candidates[0].content?.parts;
        if (parts) {
          for (const part of parts) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anyPart = part as any;
            if (anyPart.inlineData && anyPart.inlineData.mimeType?.startsWith("audio/")) {
              const audioData = `data:${anyPart.inlineData.mimeType};base64,${anyPart.inlineData.data}`;

              // Deduct credits after successful generation
              const deductResult = await deductCredits(
                session.user.id,
                requiredCredits,
                "speech-generation",
                `Generated speech: ${text.substring(0, 50)}...`
              );

              if (!deductResult.success && !deductResult.isAdmin) {
                console.error("Failed to deduct credits:", deductResult.error);
              }

              return NextResponse.json({
                audioUrl: audioData,
                text,
                voice,
                creditsUsed: requiredCredits,
                newBalance: deductResult.newBalance,
              });
            }
          }
        }
      }

      // If the TTS model didn't work, return with browser TTS option
      return NextResponse.json({
        useBrowserTTS: true,
        text,
        voice,
        message: "Server TTS not available. Using browser text-to-speech instead.",
        creditsUsed: 0,
      });
    } catch (ttsError) {
      console.error("TTS generation error:", ttsError);

      // Return with browser TTS fallback - no credits charged for fallback
      return NextResponse.json({
        useBrowserTTS: true,
        text,
        voice,
        message: "Server TTS not available. Using browser text-to-speech instead.",
        creditsUsed: 0,
      });
    }
  } catch (error) {
    console.error("Speech generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech", details: String(error) },
      { status: 500 }
    );
  }
}
