"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ImageGenerator } from "@/components/tools/ImageGenerator";
import { VideoGenerator } from "@/components/tools/VideoGenerator";
import ImageAnalyzer from "@/components/tools/ImageAnalyzer";
import ImageEditor from "@/components/tools/ImageEditor";
import AudioTranscriber from "@/components/tools/AudioTranscriber";
import SpeechGenerator from "@/components/tools/SpeechGenerator";
import WebSearch from "@/components/tools/WebSearch";
import { useAppStore, type Tool } from "@/store";
import {
  Film,
  Construction,
  Menu,
  X,
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
        <div className="h-full overflow-auto p-4 md:p-6">
          <ImageEditor />
        </div>
      );
    case "image-analyze":
      return (
        <div className="h-full overflow-auto p-4 md:p-6">
          <ImageAnalyzer />
        </div>
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
        <div className="h-full overflow-auto p-4 md:p-6">
          <AudioTranscriber />
        </div>
      );
    case "speech-generate":
      return (
        <div className="h-full overflow-auto p-4 md:p-6">
          <SpeechGenerator />
        </div>
      );
    case "web-search":
      return (
        <div className="h-full overflow-auto p-4 md:p-6">
          <WebSearch />
        </div>
      );
    default:
      return <ChatInterface />;
  }
}

export default function Home() {
  const { currentTool } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile menu when tool changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentTool]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[280px] z-50 md:hidden"
            >
              <Sidebar />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/10"
              >
                <X size={20} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden z-content">
        {/* Mobile Header with Menu Button */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-bold text-gradient flex-1">Creator Studio</h1>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Tool Content Area */}
        <motion.div
          key={currentTool}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-hidden pb-16 md:pb-0"
        >
          <ToolContent tool={currentTool} />
        </motion.div>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </main>

      {/* Floating Orbs (Decorative) - Hidden on mobile for performance */}
      <div className="hidden md:block fixed inset-0 pointer-events-none overflow-hidden z-0">
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
