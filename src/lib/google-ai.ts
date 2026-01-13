import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

// Safety settings for all models
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// =============================================================================
// TEXT GENERATION - Gemini 3 Pro / Gemini 2.5 Flash
// =============================================================================

export interface TextGenerationOptions {
  model?: "gemini-2.0-flash" | "gemini-1.5-pro" | "gemini-1.5-flash";
  temperature?: number;
  maxTokens?: number;
  useThinking?: boolean;
  systemPrompt?: string;
}

export async function generateText(
  prompt: string,
  options: TextGenerationOptions = {}
) {
  const {
    model = "gemini-2.0-flash",
    temperature = 0.7,
    maxTokens = 8192,
    systemPrompt,
  } = options;

  const generativeModel = genAI.getGenerativeModel({
    model,
    safetySettings,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  const parts = [];
  if (systemPrompt) {
    parts.push({ text: `System: ${systemPrompt}\n\nUser: ${prompt}` });
  } else {
    parts.push({ text: prompt });
  }

  const result = await generativeModel.generateContent(parts);
  const response = result.response;

  return {
    text: response.text(),
    usage: {
      inputTokens: response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
    },
  };
}

// Streaming version
export async function* streamText(
  prompt: string,
  options: TextGenerationOptions = {}
) {
  const {
    model = "gemini-2.0-flash",
    temperature = 0.7,
    maxTokens = 8192,
    systemPrompt,
  } = options;

  const generativeModel = genAI.getGenerativeModel({
    model,
    safetySettings,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  const fullPrompt = systemPrompt
    ? `System: ${systemPrompt}\n\nUser: ${prompt}`
    : prompt;

  const result = await generativeModel.generateContentStream(fullPrompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}

// =============================================================================
// IMAGE GENERATION - Imagen 3 (via Vertex AI)
// Note: Direct image generation requires Vertex AI SDK
// =============================================================================

export interface ImageGenerationOptions {
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  style?: string;
  numberOfImages?: number;
}

export async function generateImage(
  prompt: string,
  options: ImageGenerationOptions = {}
) {
  // Note: Image generation with Imagen requires Vertex AI
  // This is a placeholder for the API structure
  const { aspectRatio = "1:1", style, numberOfImages = 1 } = options;

  // For now, we'll use the text model to enhance the prompt
  const enhancedPrompt = style
    ? `Create an image in ${style} style: ${prompt}`
    : prompt;

  // In production, this would call Vertex AI's Imagen API
  // or use the Google AI Studio's image generation endpoint

  return {
    images: [], // Would contain base64 encoded images
    prompt: enhancedPrompt,
    aspectRatio,
    numberOfImages,
  };
}

// =============================================================================
// IMAGE ANALYSIS - Gemini Vision
// =============================================================================

export async function analyzeImage(
  imageData: string, // Base64 encoded image
  prompt: string,
  mimeType: string = "image/png"
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings,
  });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: imageData,
      },
    },
    { text: prompt },
  ]);

  return {
    text: result.response.text(),
    usage: {
      inputTokens: result.response.usageMetadata?.promptTokenCount || 0,
      outputTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
    },
  };
}

// =============================================================================
// VIDEO GENERATION - Veo (via Vertex AI)
// =============================================================================

export interface VideoGenerationOptions {
  duration?: 4 | 8 | 16;
  aspectRatio?: "16:9" | "9:16" | "1:1";
}

export async function generateVideo(
  prompt: string,
  options: VideoGenerationOptions = {}
) {
  // Note: Video generation with Veo requires Vertex AI
  // This is a placeholder for the API structure
  const { duration = 8, aspectRatio = "16:9" } = options;

  return {
    videoUrl: null, // Would contain the video URL
    prompt,
    duration,
    aspectRatio,
    status: "pending",
  };
}

export async function animateImage(
  imageData: string,
  prompt: string,
  options: VideoGenerationOptions = {}
) {
  // Note: Image-to-video requires Vertex AI's Veo API
  const { duration = 4, aspectRatio = "16:9" } = options;

  return {
    videoUrl: null,
    prompt,
    duration,
    aspectRatio,
    status: "pending",
  };
}

// =============================================================================
// VIDEO ANALYSIS - Gemini with Video Input
// =============================================================================

export async function analyzeVideo(
  videoUrl: string,
  prompt: string
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings,
  });

  // For videos, we need to use fileData with a URI
  const result = await model.generateContent([
    {
      fileData: {
        mimeType: "video/mp4",
        fileUri: videoUrl,
      },
    },
    { text: prompt },
  ]);

  return {
    text: result.response.text(),
    usage: {
      inputTokens: result.response.usageMetadata?.promptTokenCount || 0,
      outputTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
    },
  };
}

// =============================================================================
// AUDIO TRANSCRIPTION - Gemini with Audio Input
// =============================================================================

export async function transcribeAudio(
  audioData: string, // Base64 encoded audio
  mimeType: string = "audio/mp3"
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings,
  });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: audioData,
      },
    },
    {
      text: "Transcribe this audio. Include timestamps for each segment. Format: [MM:SS] text",
    },
  ]);

  return {
    text: result.response.text(),
    usage: {
      inputTokens: result.response.usageMetadata?.promptTokenCount || 0,
      outputTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
    },
  };
}

// =============================================================================
// SEARCH GROUNDING - Gemini with Google Search
// =============================================================================

export async function searchAndGenerate(query: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings,
    // Note: Search grounding requires specific API configuration
    // tools: [{ googleSearchRetrieval: {} }],
  });

  const result = await model.generateContent([
    {
      text: `Search for current information and answer: ${query}`,
    },
  ]);

  return {
    text: result.response.text(),
    // searchResults would be included with grounding enabled
    usage: {
      inputTokens: result.response.usageMetadata?.promptTokenCount || 0,
      outputTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
    },
  };
}

// =============================================================================
// CHAT SESSION - Multi-turn Conversation
// =============================================================================

export function createChatSession(systemPrompt?: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings,
    systemInstruction: systemPrompt,
  });

  return model.startChat({
    history: [],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function calculateCredits(
  feature: string,
  inputTokens: number,
  outputTokens: number
): number {
  // Credit calculation based on feature and token usage
  const creditRates: Record<string, { input: number; output: number }> = {
    "text-generation": { input: 0.01, output: 0.03 },
    "image-generation": { input: 0, output: 600 }, // Flat rate
    "image-analysis": { input: 0.02, output: 0.03 },
    "video-generation": { input: 0, output: 6000 }, // Flat rate per 8s
    "video-analysis": { input: 0.02, output: 0.03 },
    "audio-transcription": { input: 0.01, output: 0.02 },
    "search": { input: 0.02, output: 0.04 },
  };

  const rate = creditRates[feature] || { input: 0.01, output: 0.03 };

  if (feature === "image-generation" || feature === "video-generation") {
    return rate.output;
  }

  return Math.ceil(inputTokens * rate.input + outputTokens * rate.output);
}

export async function checkApiKey(): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    await model.generateContent("Hello");
    return true;
  } catch {
    return false;
  }
}
