import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { imageData, prompt = "Analyze this image in detail. Describe what you see, the style, colors, composition, and any notable elements." } = await request.json();

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google AI API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Use Gemini 2.0 Flash for vision tasks
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

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
          { text: prompt },
        ],
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    const response = result.response;
    const analysis = response.text();

    return NextResponse.json({
      analysis,
      prompt,
      creditsUsed: Math.ceil(
        ((response.usageMetadata?.promptTokenCount || 0) * 0.01) +
        ((response.usageMetadata?.candidatesTokenCount || 0) * 0.03)
      ),
    });
  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image", details: String(error) },
      { status: 500 }
    );
  }
}
