import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // 5 minutes for video generation

export async function POST(request: NextRequest) {
  try {
    const { prompt, duration = 8, aspectRatio = "16:9", mode = "text-to-video", imageData } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google AI API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Calculate credits based on duration
    const creditCosts: Record<number, number> = {
      4: 3000,
      8: 6000,
      16: 12000,
    };
    const creditsUsed = creditCosts[duration] || 6000;

    // Try using Veo model for video generation
    try {
      const model = genAI.getGenerativeModel({
        model: "veo-3.0-generate-preview", // Veo 3 Pro model
      });

      let result;

      if (mode === "image-to-video" && imageData) {
        // Image-to-video animation
        result = await model.generateContent({
          contents: [{
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/png",
                  data: imageData.replace(/^data:image\/\w+;base64,/, ""),
                },
              },
              { text: `Animate this image: ${prompt}. Duration: ${duration} seconds.` },
            ],
          }],
          generationConfig: {
            // @ts-expect-error - Veo specific config
            responseModalities: ["video"],
            videoDuration: duration,
          },
        });
      } else {
        // Text-to-video
        result = await model.generateContent({
          contents: [{
            role: "user",
            parts: [{ text: `Create a ${duration} second video: ${prompt}` }],
          }],
          generationConfig: {
            // @ts-expect-error - Veo specific config
            responseModalities: ["video"],
            videoDuration: duration,
            aspectRatio: aspectRatio,
          },
        });
      }

      const response = result.response;

      // Extract video data from response
      if (response.candidates && response.candidates[0]) {
        const parts = response.candidates[0].content?.parts;
        if (parts) {
          for (const part of parts) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anyPart = part as any;
            if (anyPart.inlineData && anyPart.inlineData.mimeType?.startsWith("video/")) {
              const videoData = `data:${anyPart.inlineData.mimeType};base64,${anyPart.inlineData.data}`;
              return NextResponse.json({
                videoUrl: videoData,
                prompt,
                duration,
                aspectRatio,
                creditsUsed,
                status: "completed",
              });
            }
            if (anyPart.fileData && anyPart.fileData.fileUri) {
              return NextResponse.json({
                videoUrl: anyPart.fileData.fileUri,
                prompt,
                duration,
                aspectRatio,
                creditsUsed,
                status: "completed",
              });
            }
          }
        }
      }

      return NextResponse.json(
        {
          error: "Video generation did not return a video. The Veo model may not be available for your API key.",
          details: "Please ensure your Google AI API key has access to Veo models."
        },
        { status: 500 }
      );
    } catch (veoError) {
      console.error("Veo 3 Pro generation error:", veoError);

      // Return helpful error message
      return NextResponse.json(
        {
          error: "Video generation failed",
          details: veoError instanceof Error ? veoError.message : "Veo 3 Pro model may not be available. Please check your API access.",
          suggestion: "Video generation requires access to Google's Veo 3 Pro model. Make sure your API key has the necessary permissions."
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate video", details: String(error) },
      { status: 500 }
    );
  }
}
