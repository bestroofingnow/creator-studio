"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Search,
  Bell,
  User,
  Zap,
  Plus,
  ChevronDown,
  LogOut,
  Settings,
  CreditCard,
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
  "video-generate": "Generate videos with Veo 3 Pro",
  "video-analyze": "Analyze and understand video content",
  "audio-transcribe": "Convert speech to text with high accuracy",
  "speech-generate": "Convert text to natural-sounding speech",
  "web-search": "Search the web with AI-powered grounding",
};

export function Header() {
  const { currentTool } = useAppStore();
  const { data: session, status } = useSession();
  const [credits, setCredits] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch credits from server
  useEffect(() => {
    const fetchCredits = async () => {
      if (session) {
        try {
          const res = await fetch("/api/credits");
          if (res.ok) {
            const data = await res.json();
            setCredits(data.credits || 0);
          }
        } catch (error) {
          console.error("Failed to fetch credits:", error);
        }
      }
    };

    fetchCredits();
    // Refresh credits every 30 seconds
    const interval = setInterval(fetchCredits, 30000);
    return () => clearInterval(interval);
  }, [session]);

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
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {session ? (
          <>
            {/* Credits Button */}
            <Link href="/pricing">
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
            </Link>

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
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 h-10 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-7 h-7 rounded-lg"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center">
                    <User size={14} className="text-black" />
                  </div>
                )}
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-[var(--foreground-muted)] transition-transform",
                    menuOpen && "rotate-180"
                  )}
                />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 glass-card p-2 z-50"
                  >
                    <div className="px-3 py-2 border-b border-white/10 mb-2">
                      <p className="font-medium truncate">
                        {session.user?.name || "User"}
                      </p>
                      <p className="text-xs text-[var(--foreground-muted)] truncate">
                        {session.user?.email}
                      </p>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Settings size={16} className="text-[var(--foreground-muted)]" />
                      <span>Account</span>
                    </Link>

                    <Link
                      href="/pricing"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <CreditCard size={16} className="text-[var(--foreground-muted)]" />
                      <span>Upgrade Plan</span>
                    </Link>

                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-red-400"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary"
            >
              Sign In
            </motion.button>
          </Link>
        )}
      </div>

      {/* Close menu when clicking outside */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
