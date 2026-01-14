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

    const { query, searchType = "general" } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Check credits before processing
    const creditCheck = await checkCredits(session.user.id, CREDIT_COSTS["web-search"]);
    if (!creditCheck.hasEnoughCredits) {
      return NextResponse.json(
        { error: "Insufficient credits", required: CREDIT_COSTS["web-search"], current: creditCheck.currentCredits },
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

    // Use Gemini 2.0 Flash with Google Search grounding
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    // Build search prompt based on type
    const searchPrompt = getSearchPrompt(searchType, query);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: searchPrompt }],
      }],
      tools: [{
        googleSearch: {},
      }] as any,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    });

    const response = result.response;
    const searchResult = response.text();

    // Extract grounding metadata if available
    let sources: Array<{ title: string; url: string; snippet: string }> = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyResponse = response as any;
    const groundingMetadata = anyResponse.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sources = groundingMetadata.groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title || "Web Result",
          url: chunk.web.uri || "",
          snippet: "",
        }))
        .slice(0, 10);
    }

    // Parse any structured search results from the response
    const structuredResults = parseSearchResults(searchResult);

    // Deduct credits after successful search
    const deductResult = await deductCredits(
      session.user.id,
      CREDIT_COSTS["web-search"],
      "web-search",
      `Web search: ${query.substring(0, 50)}...`
    );

    if (!deductResult.success && !deductResult.isAdmin) {
      console.error("Failed to deduct credits:", deductResult.error);
    }

    return NextResponse.json({
      query,
      summary: searchResult,
      sources: sources.length > 0 ? sources : structuredResults.sources,
      searchType,
      creditsUsed: CREDIT_COSTS["web-search"],
      newBalance: deductResult.newBalance,
    });
  } catch (error) {
    console.error("Web search error:", error);

    // Check if it's a grounding not available error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("grounding") || errorMessage.includes("search")) {
      return NextResponse.json(
        {
          error: "Search grounding not available",
          details: "Google Search grounding may require additional API access.",
          suggestion: "Ensure your API key has access to Google Search grounding features.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to perform search", details: errorMessage },
      { status: 500 }
    );
  }
}

function getSearchPrompt(searchType: string, query: string): string {
  const prompts: Record<string, string> = {
    general: `Search the web and provide a comprehensive answer to this query: "${query}"

Please include:
1. A clear, informative summary answering the query
2. Key facts and data points
3. Multiple perspectives if relevant
4. Current and up-to-date information

Format your response with clear sections and bullet points where appropriate.`,

    news: `Search for the latest news about: "${query}"

Provide:
1. Recent news headlines and summaries
2. Key developments and updates
3. Important quotes or statements
4. Timeline of recent events if applicable

Focus on the most recent and relevant news.`,

    research: `Conduct research on: "${query}"

Provide:
1. Academic and authoritative sources
2. Key findings and statistics
3. Different viewpoints and debates
4. Historical context if relevant
5. Current state of knowledge

Be thorough and cite specific findings.`,

    howto: `Find instructions for: "${query}"

Provide:
1. Step-by-step instructions
2. Required materials or prerequisites
3. Common mistakes to avoid
4. Tips for success
5. Alternative approaches if available

Make the instructions clear and actionable.`,

    comparison: `Compare and analyze: "${query}"

Provide:
1. Key differences and similarities
2. Pros and cons of each option
3. Use cases for each
4. Recommendations based on different needs
5. Price/value comparison if relevant

Be objective and balanced in your analysis.`,
  };

  return prompts[searchType] || prompts.general;
}

function parseSearchResults(text: string): { sources: Array<{ title: string; url: string; snippet: string }> } {
  // Try to extract any URLs mentioned in the response
  const urlRegex = /https?:\/\/[^\s<>"]+/g;
  const urls = text.match(urlRegex) || [];

  const sources = urls.slice(0, 5).map((url, index) => ({
    title: `Source ${index + 1}`,
    url,
    snippet: "",
  }));

  return { sources };
}
