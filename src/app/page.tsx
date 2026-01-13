"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ImageGenerator } from "@/components/tools/ImageGenerator";
import { VideoGenerator } from "@/components/tools/VideoGenerator";
import { useAppStore, type Tool } from "@/store";
import {
  ScanEye,
  Film,
  Mic,
  Volume2,
  Globe,
  Construction,
  Sparkles,
} from "lucide-react";

// Placeholder component for tools not yet implemented
function ComingSoon({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6">
      <motion.div
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--neon-cyan)]/10 to-[var(--neon-purple)]/10 flex items-center justify-center mb-6 border border-white/5"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        <span className="text-[var(--foreground-subtle)]">{icon}</span>
      </motion.div>
      <h2 className="text-2xl font-bold text-gradient mb-3">{title}</h2>
      <div className="flex items-center gap-2 text-[var(--neon-orange)]">
        <Construction size={18} />
        <span>Coming Soon</span>
      </div>
      <p className="text-[var(--foreground-muted)] max-w-md mt-4">
        This feature is currently under development. Check back soon for
        AI-powered {title.toLowerCase()} capabilities!
      </p>
    </div>
  );
}

// Tool content router
function ToolContent({ tool }: { tool: Tool }) {
  switch (tool) {
    case "chat":
      return <ChatInterface />;
    case "image-generate":
      return <ImageGenerator />;
    case "image-edit":
      return (
        <ComingSoon
          title="Image Editing"
          icon={<Sparkles size={48} />}
        />
      );
    case "image-analyze":
      return (
        <ComingSoon
          title="Image Analysis"
          icon={<ScanEye size={48} />}
        />
      );
    case "video-generate":
      return <VideoGenerator />;
    case "video-analyze":
      return (
        <ComingSoon
          title="Video Analysis"
          icon={<Film size={48} />}
        />
      );
    case "audio-transcribe":
      return (
        <ComingSoon
          title="Audio Transcription"
          icon={<Mic size={48} />}
        />
      );
    case "speech-generate":
      return (
        <ComingSoon
          title="Speech Generation"
          icon={<Volume2 size={48} />}
        />
      );
    case "web-search":
      return (
        <ComingSoon
          title="Web Search"
          icon={<Globe size={48} />}
        />
      );
    default:
      return <ChatInterface />;
  }
}

export default function Home() {
  const { currentTool } = useAppStore();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden z-content">
        {/* Header */}
        <Header />

        {/* Tool Content Area */}
        <motion.div
          key={currentTool}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-hidden"
        >
          <ToolContent tool={currentTool} />
        </motion.div>
      </main>

      {/* Floating Orbs (Decorative) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, transparent 70%)",
            top: "10%",
            right: "10%",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(191, 0, 255, 0.1) 0%, transparent 70%)",
            bottom: "20%",
            left: "5%",
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
