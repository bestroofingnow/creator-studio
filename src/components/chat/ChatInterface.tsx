"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  Paperclip,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Volume2,
  StopCircle,
  Loader2,
  Bot,
  User,
  Image as ImageIcon,
  Video,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";

interface SuggestionChip {
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

const suggestions: SuggestionChip[] = [
  {
    icon: <FileText size={14} />,
    label: "Write a blog post",
    prompt: "Write a professional blog post about ",
  },
  {
    icon: <ImageIcon size={14} />,
    label: "Generate an image",
    prompt: "Create an image of ",
  },
  {
    icon: <Video size={14} />,
    label: "Create a video",
    prompt: "Generate a short video showing ",
  },
  {
    icon: <Sparkles size={14} />,
    label: "Brainstorm ideas",
    prompt: "Give me creative ideas for ",
  },
];

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, addMessage, isGenerating, setIsGenerating } = useAppStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput("");
    addMessage({ role: "user", content: userMessage });
    setIsGenerating(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      addMessage({
        role: "assistant",
        content: `I received your message: "${userMessage}"\n\nThis is a demo response. In the full version, I would use Google's Gemini 3 Pro to generate an intelligent response based on your input.\n\nI can help you with:\n- Creating text content\n- Generating images\n- Making videos\n- Analyzing media\n- And much more!`,
      });
      setIsGenerating(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            {/* Hero Section */}
            <motion.div
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center mb-8 neon-glow"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Sparkles size={48} className="text-black" />
            </motion.div>

            <h2 className="text-3xl font-bold text-gradient mb-3">
              Welcome to Creator Studio
            </h2>
            <p className="text-[var(--foreground-muted)] max-w-md mb-8">
              Your AI-powered creative assistant. Generate text, images, videos,
              and more with cutting-edge AI models.
            </p>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestionClick(suggestion.prompt)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl glass-card hover:border-[var(--neon-cyan)]/30 transition-all"
                >
                  <span className="text-[var(--neon-cyan)]">
                    {suggestion.icon}
                  </span>
                  <span className="text-sm">{suggestion.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex items-center gap-8 text-sm text-[var(--foreground-subtle)]"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
                <span>Gemini 3 Pro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--neon-cyan)] animate-pulse" />
                <span>Nano Banana Pro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--neon-purple)] animate-pulse" />
                <span>Veo 3.1</span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex gap-4",
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                    message.role === "user"
                      ? "bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-blue)]"
                      : "bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-pink)]"
                  )}
                >
                  {message.role === "user" ? (
                    <User size={18} className="text-black" />
                  ) : (
                    <Bot size={18} className="text-black" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={cn(
                    "flex-1 max-w-[80%]",
                    message.role === "user" ? "text-right" : "text-left"
                  )}
                >
                  <div
                    className={cn(
                      message.role === "user"
                        ? "chat-bubble-user inline-block text-left"
                        : "chat-bubble-ai"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Message Actions */}
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mt-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          copyToClipboard(message.content, message.id)
                        }
                        className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--foreground-subtle)] transition-colors"
                      >
                        {copiedId === message.id ? (
                          <Check size={14} className="text-[var(--neon-green)]" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--foreground-subtle)] transition-colors"
                      >
                        <RefreshCw size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--foreground-subtle)] transition-colors"
                      >
                        <Volume2 size={14} />
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-pink)] flex items-center justify-center">
                <Bot size={18} className="text-black" />
              </div>
              <div className="chat-bubble-ai flex items-center gap-2">
                <div className="loading-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="text-sm text-[var(--foreground-muted)]">
                  Generating response...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5">
        <motion.div
          className="glass-card p-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-end gap-3">
            {/* Attachment Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 rounded-xl hover:bg-white/5 text-[var(--foreground-muted)] transition-colors"
            >
              <Paperclip size={20} />
            </motion.button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message or describe what you want to create..."
                rows={1}
                className="w-full bg-transparent border-none outline-none resize-none text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] max-h-[200px]"
              />
            </div>

            {/* Voice Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsRecording(!isRecording)}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                isRecording
                  ? "bg-[var(--neon-pink)]/20 text-[var(--neon-pink)]"
                  : "hover:bg-white/5 text-[var(--foreground-muted)]"
              )}
            >
              {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
            </motion.button>

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                input.trim() && !isGenerating
                  ? "bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-blue)] text-black"
                  : "bg-white/5 text-[var(--foreground-subtle)]"
              )}
            >
              {isGenerating ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </motion.button>
          </div>

          {/* Character Count & Model Info */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-3 text-xs text-[var(--foreground-subtle)]">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)]" />
                Gemini 3 Pro
              </span>
              <span>•</span>
              <span>~30 credits/message</span>
            </div>
            <span className="text-xs text-[var(--foreground-subtle)]">
              {input.length} / 4000
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
