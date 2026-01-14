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

    const { prompt, aspectRatio = "1:1", style, numberOfImages = 4 } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Calculate required credits based on number of images
    const requiredCredits = CREDIT_COSTS["image-generate"] * numberOfImages;

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

    // Enhance prompt with style if provided
    const enhancedPrompt = style
      ? `${prompt}, in ${style} style, high quality, detailed`
      : `${prompt}, high quality, detailed`;

    // Use Imagen 3 for image generation
    const model = genAI.getGenerativeModel({
      model: "imagen-3.0-generate-002",
    });

    const images: string[] = [];

    // Generate images (Imagen generates one at a time)
    for (let i = 0; i < numberOfImages; i++) {
      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: enhancedPrompt }] }],
          generationConfig: {
            // @ts-expect-error - Imagen specific config
            responseModalities: ["image"],
            imageDimensions: getImageDimensions(aspectRatio),
          },
        });

        const response = result.response;

        // Extract image data from response
        if (response.candidates && response.candidates[0]) {
          const parts = response.candidates[0].content?.parts;
          if (parts) {
            for (const part of parts) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const anyPart = part as any;
              if (anyPart.inlineData) {
                images.push(`data:${anyPart.inlineData.mimeType};base64,${anyPart.inlineData.data}`);
              }
            }
          }
        }
      } catch (imgError) {
        console.error(`Error generating image ${i + 1}:`, imgError);
      }
    }

    if (images.length === 0) {
      // Fallback: Try using Gemini 2.0 Flash with image generation
      try {
        const flashModel = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-exp-image-generation",
        });

        for (let i = 0; i < numberOfImages; i++) {
          const result = await flashModel.generateContent({
            contents: [{
              role: "user",
              parts: [{ text: `Generate an image: ${enhancedPrompt}` }]
            }],
            generationConfig: {
              // @ts-expect-error - Image generation config
              responseModalities: ["image", "text"],
            },
          });

          const response = result.response;
          if (response.candidates && response.candidates[0]) {
            const parts = response.candidates[0].content?.parts;
            if (parts) {
              for (const part of parts) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const anyPart = part as any;
                if (anyPart.inlineData) {
                  images.push(`data:${anyPart.inlineData.mimeType};base64,${anyPart.inlineData.data}`);
                }
              }
            }
          }
        }
      } catch (fallbackError) {
        console.error("Fallback image generation failed:", fallbackError);
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        {
          error: "Image generation failed. Please check your API key has access to Imagen models.",
          details: "Make sure your Google AI API key has access to image generation models."
        },
        { status: 500 }
      );
    }

    // Calculate actual credits used based on images generated
    const creditsUsed = images.length * CREDIT_COSTS["image-generate"];

    // Deduct credits after successful generation
    const deductResult = await deductCredits(
      session.user.id,
      creditsUsed,
      "image-generation",
      `Generated ${images.length} image(s): ${prompt.substring(0, 50)}...`
    );

    if (!deductResult.success && !deductResult.isAdmin) {
      console.error("Failed to deduct credits:", deductResult.error);
    }

    return NextResponse.json({
      images,
      prompt: enhancedPrompt,
      aspectRatio,
      creditsUsed,
      newBalance: deductResult.newBalance,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate images", details: String(error) },
      { status: 500 }
    );
  }
}

function getImageDimensions(aspectRatio: string): { width: number; height: number } {
  const dimensions: Record<string, { width: number; height: number }> = {
    "1:1": { width: 1024, height: 1024 },
    "16:9": { width: 1536, height: 864 },
    "9:16": { width: 864, height: 1536 },
    "4:3": { width: 1408, height: 1056 },
    "3:4": { width: 1056, height: 1408 },
  };
  return dimensions[aspectRatio] || dimensions["1:1"];
}
