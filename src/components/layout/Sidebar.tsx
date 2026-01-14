"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  MessageSquare,
  Image,
  Wand2,
  ScanEye,
  Video,
  Film,
  Mic,
  Volume2,
  Globe,
  Sparkles,
  ChevronLeft,
  Zap,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn, formatCredits } from "@/lib/utils";
import { useAppStore, type Tool } from "@/store";

interface NavItem {
  id: Tool;
  label: string;
  icon: React.ReactNode;
  description: string;
  credits?: string;
}

const tools: NavItem[] = [
  {
    id: "chat",
    label: "AI Chat",
    icon: <MessageSquare size={20} />,
    description: "Conversation with AI",
    credits: "~30/msg",
  },
  {
    id: "image-generate",
    label: "Image Generation",
    icon: <Image size={20} />,
    description: "Create with Nano Banana Pro",
    credits: "600",
  },
  {
    id: "image-edit",
    label: "Image Editing",
    icon: <Wand2 size={20} />,
    description: "Edit with Gemini 2.5 Flash",
    credits: "600",
  },
  {
    id: "image-analyze",
    label: "Analyze Image",
    icon: <ScanEye size={20} />,
    description: "Understand images with AI",
    credits: "100",
  },
  {
    id: "video-generate",
    label: "Video Generation",
    icon: <Video size={20} />,
    description: "Create with Veo 2",
    credits: "6,000",
  },
  {
    id: "video-analyze",
    label: "Video Analysis",
    icon: <Film size={20} />,
    description: "Understand video content",
    credits: "500",
  },
  {
    id: "audio-transcribe",
    label: "Audio Transcription",
    icon: <Mic size={20} />,
    description: "Speech-to-text with Gemini",
    credits: "300/min",
  },
  {
    id: "speech-generate",
    label: "Generate Speech",
    icon: <Volume2 size={20} />,
    description: "Text-to-natural speech",
    credits: "120/1K",
  },
  {
    id: "web-search",
    label: "Web Search",
    icon: <Globe size={20} />,
    description: "Search with grounding",
    credits: "150",
  },
];

export function Sidebar() {
  const { currentTool, setCurrentTool, sidebarOpen, toggleSidebar, credits } =
    useAppStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 280 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="sidebar h-screen flex flex-col z-50"
    >
      {/* Logo */}
      <Link href="/" className="p-4 flex items-center gap-3 border-b border-white/5 hover:bg-white/5 transition-colors">
        <motion.div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center neon-glow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sparkles size={22} className="text-black" />
        </motion.div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-lg font-bold text-gradient">Creator Studio</h1>
              <p className="text-xs text-[var(--foreground-subtle)]">
                AI-Powered Creation
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--background-secondary)] border border-[var(--glass-border)] flex items-center justify-center hover:border-[var(--neon-cyan)] transition-colors z-10"
      >
        <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }}>
          <ChevronLeft size={14} className="text-[var(--foreground-muted)]" />
        </motion.div>
      </button>

      {/* Credits Display */}
      <div className="p-4">
        <motion.div
          className={cn(
            "credits-display",
            !sidebarOpen && "justify-center p-3"
          )}
          whileHover={{ scale: 1.02 }}
        >
          <div className="credits-icon">
            <Zap size={16} className="text-black" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <p className="text-xs text-[var(--foreground-muted)]">Credits</p>
                <p className="text-lg font-bold text-[var(--neon-cyan)]">
                  {formatCredits(credits)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-2 text-xs font-semibold text-[var(--foreground-subtle)] uppercase tracking-wider"
            >
              AI Tools
            </motion.p>
          )}
        </AnimatePresence>

        {tools.map((tool, index) => (
          <motion.button
            key={tool.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setCurrentTool(tool.id)}
            className={cn(
              "sidebar-item w-full text-left",
              currentTool === tool.id && "active",
              !sidebarOpen && "justify-center px-3"
            )}
          >
            <span
              className={cn(
                "flex-shrink-0 transition-colors",
                currentTool === tool.id
                  ? "text-[var(--neon-cyan)]"
                  : "text-[var(--foreground-muted)]"
              )}
            >
              {tool.icon}
            </span>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{tool.label}</span>
                    {tool.credits && (
                      <span className="text-xs text-[var(--foreground-subtle)] ml-2">
                        {tool.credits}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--foreground-subtle)] truncate">
                    {tool.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <button
          className={cn(
            "sidebar-item w-full",
            !sidebarOpen && "justify-center px-3"
          )}
        >
          <Settings size={20} />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          className={cn(
            "sidebar-item w-full",
            !sidebarOpen && "justify-center px-3"
          )}
        >
          <HelpCircle size={20} />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Help & Support
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
