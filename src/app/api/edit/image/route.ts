import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { imageData, editPrompt, editType = "general" } = await request.json();

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    if (!editPrompt) {
      return NextResponse.json({ error: "Edit prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google AI API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Extract base64 data and mime type
    const matches = imageData.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: "Invalid image data format" },
        { status: 400 }
      );
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Try Gemini 2.0 Flash with image generation for editing
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp-image-generation",
      });

      const editInstructions = getEditInstructions(editType, editPrompt);

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
            { text: editInstructions },
          ],
        }],
        generationConfig: {
          // @ts-expect-error - Image generation config
          responseModalities: ["image", "text"],
        },
      });

      const response = result.response;

      // Extract edited image from response
      if (response.candidates && response.candidates[0]) {
        const parts = response.candidates[0].content?.parts;
        if (parts) {
          for (const part of parts) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anyPart = part as any;
            if (anyPart.inlineData) {
              const editedImage = `data:${anyPart.inlineData.mimeType};base64,${anyPart.inlineData.data}`;
              return NextResponse.json({
                editedImage,
                prompt: editPrompt,
                editType,
                creditsUsed: 800,
              });
            }
          }
        }
      }

      // If no image was generated, return a helpful error
      return NextResponse.json(
        {
          error: "Image editing did not produce a result",
          details: "The model may not support this type of edit. Try a different prompt.",
        },
        { status: 500 }
      );
    } catch (geminiError) {
      console.error("Gemini image edit error:", geminiError);

      // Fallback: Use Imagen for inpainting/editing if available
      try {
        const imagenModel = genAI.getGenerativeModel({
          model: "imagen-3.0-generate-002",
        });

        // For editing, we describe the edit as a generation prompt
        const result = await imagenModel.generateContent({
          contents: [{
            role: "user",
            parts: [
              { text: `Edit an image: Original shows ${editPrompt}. Apply the following modification: ${editPrompt}` }
            ],
          }],
          generationConfig: {
            // @ts-expect-error - Imagen specific config
            responseModalities: ["image"],
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
                const editedImage = `data:${anyPart.inlineData.mimeType};base64,${anyPart.inlineData.data}`;
                return NextResponse.json({
                  editedImage,
                  prompt: editPrompt,
                  editType,
                  creditsUsed: 800,
                  note: "Generated as new image based on edit description",
                });
              }
            }
          }
        }
      } catch (imagenError) {
        console.error("Imagen fallback error:", imagenError);
      }

      return NextResponse.json(
        {
          error: "Image editing failed",
          details: geminiError instanceof Error ? geminiError.message : "Unknown error",
          suggestion: "Image editing requires Gemini 2.0 Flash with image generation capability.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Image edit error:", error);
    return NextResponse.json(
      { error: "Failed to edit image", details: String(error) },
      { status: 500 }
    );
  }
}

function getEditInstructions(editType: string, userPrompt: string): string {
  const instructions: Record<string, string> = {
    general: `Edit this image according to these instructions: ${userPrompt}. Generate the edited version of the image.`,
    background: `Change the background of this image: ${userPrompt}. Keep the main subject intact and generate the result.`,
    style: `Apply this artistic style to the image: ${userPrompt}. Transform the image while maintaining its composition.`,
    enhance: `Enhance this image: ${userPrompt}. Improve quality, colors, and details as specified.`,
    remove: `Remove from this image: ${userPrompt}. Fill in the area naturally and generate the result.`,
    add: `Add to this image: ${userPrompt}. Seamlessly integrate the new element and generate the result.`,
    colorize: `Colorize or recolor this image: ${userPrompt}. Apply the color changes and generate the result.`,
    upscale: `Upscale and enhance this image: ${userPrompt}. Improve resolution and details.`,
  };

  return instructions[editType] || instructions.general;
}
