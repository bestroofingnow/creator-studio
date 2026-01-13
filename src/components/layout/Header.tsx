"use client";

import { motion } from "framer-motion";
import {
  Search,
  Bell,
  User,
  Zap,
  Plus,
  ChevronDown,
} from "lucide-react";
import { cn, formatCredits } from "@/lib/utils";
import { useAppStore, type Tool } from "@/store";

const toolTitles: Record<Tool, string> = {
  chat: "AI Chat",
  "image-generate": "Image Generation",
  "image-edit": "Image Editing",
  "image-analyze": "Image Analysis",
  "video-generate": "Video Generation",
  "video-analyze": "Video Analysis",
  "audio-transcribe": "Audio Transcription",
  "speech-generate": "Speech Generation",
  "web-search": "Web Search",
};

const toolDescriptions: Record<Tool, string> = {
  chat: "Have a conversation with Gemini 3 Pro",
  "image-generate": "Create stunning images with Nano Banana Pro",
  "image-edit": "Edit and transform images with AI",
  "image-analyze": "Extract insights and understand image content",
  "video-generate": "Generate videos with Veo 3.1",
  "video-analyze": "Analyze and understand video content",
  "audio-transcribe": "Convert speech to text with high accuracy",
  "speech-generate": "Convert text to natural-sounding speech",
  "web-search": "Search the web with AI-powered grounding",
};

export function Header() {
  const { currentTool, credits } = useAppStore();

  return (
    <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-6 z-40">
      {/* Left Section - Tool Title */}
      <div className="flex items-center gap-4">
        <motion.div
          key={currentTool}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-bold text-gradient">
            {toolTitles[currentTool]}
          </h2>
          <p className="text-sm text-[var(--foreground-muted)]">
            {toolDescriptions[currentTool]}
          </p>
        </motion.div>
      </div>

      {/* Center Section - Search (Optional) */}
      <div className="hidden lg:flex flex-1 max-w-xl mx-8">
        <div className="relative w-full">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)]"
          />
          <input
            type="text"
            placeholder="Search your creations..."
            className="input-cyber w-full pl-12 py-2.5 text-sm"
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-[var(--foreground-subtle)] bg-white/5 rounded border border-white/10">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Credits Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="credits-display h-10"
        >
          <div className="credits-icon w-6 h-6">
            <Zap size={12} className="text-black" />
          </div>
          <span className="font-semibold text-[var(--neon-cyan)]">
            {formatCredits(credits)}
          </span>
          <Plus size={16} className="text-[var(--foreground-muted)]" />
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <Bell size={18} className="text-[var(--foreground-muted)]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--neon-cyan)] rounded-full animate-pulse" />
        </motion.button>

        {/* User Menu */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 h-10 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center">
            <User size={14} className="text-black" />
          </div>
          <ChevronDown size={14} className="text-[var(--foreground-muted)]" />
        </motion.button>
      </div>
    </header>
  );
}
