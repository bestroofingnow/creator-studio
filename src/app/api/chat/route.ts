import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkCredits, deductCredits, CREDIT_COSTS } from "@/lib/credits";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, history = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check credits before processing
    const creditCheck = await checkCredits(session.user.id, CREDIT_COSTS.chat);
    if (!creditCheck.hasEnoughCredits) {
      return NextResponse.json(
        { error: "Insufficient credits", required: CREDIT_COSTS.chat, current: creditCheck.currentCredits },
        { status: 402 }
      );
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      // Return demo response if no API key
      return NextResponse.json({
        response: `I received your message: "${message}"\n\nThis is a demo response. To enable real AI responses, please add your Google AI API key to the environment variables.\n\nYou can get an API key from: https://aistudio.google.com/apikey`,
        usage: {
          inputTokens: message.length,
          outputTokens: 150,
        },
        creditsUsed: 30,
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `You are Creator Studio AI, a helpful and creative assistant specialized in content creation. You can help users:
- Write blog posts, social media content, and marketing copy
- Generate creative ideas and brainstorm concepts
- Edit and improve existing content
- Provide guidance on using AI tools for images, videos, and audio
- Answer questions about AI and content creation

Be friendly, professional, and creative. Format your responses with markdown when appropriate.`,
    });

    // Convert history to Gemini format
    const chatHistory = history.map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const result = await chat.sendMessage(message);
    const response = result.response;

    // Calculate actual credits used based on token usage
    const creditsUsed = Math.max(
      CREDIT_COSTS.chat,
      Math.ceil(
        ((response.usageMetadata?.promptTokenCount || 0) * 0.01) +
        ((response.usageMetadata?.candidatesTokenCount || 0) * 0.03)
      )
    );

    // Deduct credits after successful generation
    const deductResult = await deductCredits(
      session.user.id,
      creditsUsed,
      "chat",
      `Chat message: ${message.substring(0, 50)}...`
    );

    if (!deductResult.success && !deductResult.isAdmin) {
      console.error("Failed to deduct credits:", deductResult.error);
    }

    return NextResponse.json({
      response: response.text(),
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
      },
      creditsUsed,
      newBalance: deductResult.newBalance,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}

// Streaming version
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const message = searchParams.get("message");

  if (!message) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 }
    );
  }

  if (!process.env.GOOGLE_AI_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "You are Creator Studio AI, a helpful assistant for content creation.",
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream(message);
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
