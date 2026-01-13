import { create } from "zustand";

export type Tool =
  | "chat"
  | "image-generate"
  | "image-edit"
  | "image-analyze"
  | "video-generate"
  | "video-analyze"
  | "audio-transcribe"
  | "speech-generate"
  | "web-search";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "image" | "video" | "audio";
  mediaUrl?: string;
}

export interface GeneratedContent {
  id: string;
  type: "text" | "image" | "video" | "audio";
  title: string;
  content: string;
  mediaUrl?: string;
  prompt: string;
  model: string;
  creditsUsed: number;
  createdAt: Date;
}

interface AppState {
  // Navigation
  currentTool: Tool;
  sidebarOpen: boolean;
  setCurrentTool: (tool: Tool) => void;
  toggleSidebar: () => void;

  // Credits
  credits: number;
  useCredits: (amount: number) => boolean;
  addCredits: (amount: number) => void;

  // Chat
  messages: Message[];
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  clearMessages: () => void;

  // Generated Content
  generatedContent: GeneratedContent[];
  addGeneratedContent: (content: Omit<GeneratedContent, "id" | "createdAt">) => void;

  // Loading States
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;

  // User Profile
  userProfile: {
    name: string;
    brandVoice: string;
    industry: string;
  };
  setUserProfile: (profile: Partial<AppState["userProfile"]>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentTool: "chat",
  sidebarOpen: true,
  setCurrentTool: (tool) => set({ currentTool: tool }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Credits (start with 50,000 for demo)
  credits: 50000,
  useCredits: (amount) => {
    const { credits } = get();
    if (credits >= amount) {
      set({ credits: credits - amount });
      return true;
    }
    return false;
  },
  addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),

  // Chat
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),

  // Generated Content
  generatedContent: [],
  addGeneratedContent: (content) =>
    set((state) => ({
      generatedContent: [
        {
          ...content,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date(),
        },
        ...state.generatedContent,
      ],
    })),

  // Loading States
  isGenerating: false,
  setIsGenerating: (value) => set({ isGenerating: value }),

  // User Profile
  userProfile: {
    name: "",
    brandVoice: "",
    industry: "",
  },
  setUserProfile: (profile) =>
    set((state) => ({
      userProfile: { ...state.userProfile, ...profile },
    })),
}));
