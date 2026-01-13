import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // 1 minute for speech generation

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "Kore", speed = 1.0, pitch = 0 } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: "Text is too long. Maximum 5000 characters." }, { status: 400 });
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
              return NextResponse.json({
                audioUrl: audioData,
                text,
                voice,
                creditsUsed: Math.ceil(text.length * 0.1),
              });
            }
          }
        }
      }

      // If the TTS model didn't work, return helpful message
      return NextResponse.json(
        {
          error: "Speech generation did not return audio",
          details: "The TTS model may not be available for your API key.",
          suggestion: "Try updating your API key permissions or check if TTS is supported in your region.",
        },
        { status: 500 }
      );
    } catch (ttsError) {
      console.error("TTS generation error:", ttsError);

      // Try alternative: Use Gemini 2.0 Flash experimental with audio
      try {
        const fallbackModel = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
        });

        // For fallback, we'll generate speech-like text that can guide users
        const result = await fallbackModel.generateContent({
          contents: [{
            role: "user",
            parts: [{
              text: `Convert this text to phonetic speech notation that a text-to-speech system could use. Text: "${text}"

              Provide the text formatted for natural reading with pauses and emphasis marked.`
            }],
          }],
        });

        const response = result.response;

        // Since we couldn't generate actual audio, return a helpful message
        return NextResponse.json(
          {
            error: "Speech synthesis not available",
            details: "The Google AI TTS model requires specific API access. You can use browser-based TTS as an alternative.",
            textForTTS: text,
            suggestion: "Enable browser TTS in the component to hear the text spoken.",
          },
          { status: 503 }
        );
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }

      return NextResponse.json(
        {
          error: "Speech generation failed",
          details: ttsError instanceof Error ? ttsError.message : "Unknown error",
          suggestion: "Google AI TTS requires specific API access. Check your API key permissions.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Speech generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech", details: String(error) },
      { status: 500 }
    );
  }
}
