import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // 5 minutes for video generation

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

interface VeoOperation {
  name: string;
  done?: boolean;
  error?: { message: string; code: number };
  response?: {
    generatedSamples?: Array<{
      video?: {
        uri?: string;
        encoding?: string;
      };
    }>;
  };
}

async function startVideoGeneration(
  apiKey: string,
  prompt: string,
  aspectRatio: string,
  duration: number,
  mode: string,
  imageData?: string
): Promise<VeoOperation> {
  const model = "veo-2.0-generate-001";
  const url = `${API_BASE}/models/${model}:predictLongRunning?key=${apiKey}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestBody: any = {
    instances: [
      {
        prompt: prompt,
      },
    ],
    parameters: {
      aspectRatio: aspectRatio,
      durationSeconds: duration,
      personGeneration: "allow_adult",
      sampleCount: 1,
    },
  };

  // Add image for image-to-video mode
  if (mode === "image-to-video" && imageData) {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    requestBody.instances[0].image = {
      bytesBase64Encoded: base64Data,
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Veo API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function pollOperation(apiKey: string, operationName: string): Promise<VeoOperation> {
  const url = `${API_BASE}/${operationName}?key=${apiKey}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Operation poll error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function waitForCompletion(
  apiKey: string,
  operationName: string,
  maxWaitMs: number = 240000
): Promise<VeoOperation> {
  const startTime = Date.now();
  const pollInterval = 5000; // Poll every 5 seconds

  while (Date.now() - startTime < maxWaitMs) {
    const operation = await pollOperation(apiKey, operationName);

    if (operation.done) {
      return operation;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error("Video generation timed out after 4 minutes");
}

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

    // Calculate credits based on duration
    const creditCosts: Record<number, number> = {
      4: 3000,
      8: 6000,
      16: 12000,
    };
    const creditsUsed = creditCosts[duration] || 6000;

    // Map aspect ratio to Veo format
    const aspectRatioMap: Record<string, string> = {
      "16:9": "16:9",
      "9:16": "9:16",
      "1:1": "1:1",
    };
    const veoAspectRatio = aspectRatioMap[aspectRatio] || "16:9";

    // Map duration to Veo-supported values (5-8 seconds)
    const veoDuration = Math.min(Math.max(duration, 5), 8);

    try {
      console.log("Starting Veo video generation...", { prompt, aspectRatio: veoAspectRatio, duration: veoDuration, mode });

      // Start the video generation
      const operation = await startVideoGeneration(
        apiKey,
        prompt,
        veoAspectRatio,
        veoDuration,
        mode,
        imageData
      );

      console.log("Operation started:", operation.name);

      // Wait for completion
      const completedOperation = await waitForCompletion(apiKey, operation.name);

      if (completedOperation.error) {
        throw new Error(completedOperation.error.message);
      }

      // Extract video URL from response
      const samples = completedOperation.response?.generatedSamples;
      if (samples && samples.length > 0 && samples[0].video?.uri) {
        const videoUri = samples[0].video.uri;

        return NextResponse.json({
          videoUrl: videoUri,
          prompt,
          duration: veoDuration,
          aspectRatio: veoAspectRatio,
          creditsUsed,
          status: "completed",
        });
      }

      return NextResponse.json(
        {
          error: "Video generation completed but no video was returned",
          details: "The Veo model did not return a video. This may be due to content filtering.",
        },
        { status: 500 }
      );
    } catch (veoError) {
      console.error("Veo generation error:", veoError);

      const errorMessage = veoError instanceof Error ? veoError.message : String(veoError);

      // Check for specific error types
      if (errorMessage.includes("404") || errorMessage.includes("not found")) {
        return NextResponse.json(
          {
            error: "Veo model not available",
            details: "The Veo 2 model may not be enabled for your API key. Enable it in Google AI Studio.",
            suggestion: "Go to Google AI Studio and ensure Veo 2 is enabled for your project.",
          },
          { status: 500 }
        );
      }

      if (errorMessage.includes("403") || errorMessage.includes("permission")) {
        return NextResponse.json(
          {
            error: "Permission denied",
            details: "Your API key doesn't have permission to use Veo. Check your API key permissions.",
            suggestion: "Create a new API key with Veo access in Google AI Studio.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: "Video generation failed",
          details: errorMessage,
          suggestion: "Check that your Google AI API key has Veo 2 access enabled.",
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
