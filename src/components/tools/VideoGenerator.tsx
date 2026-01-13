"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Play,
  Pause,
  Download,
  RefreshCw,
  Loader2,
  Upload,
  Zap,
  Clock,
  Film,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";

const durations = [
  { label: "4s", value: 4, credits: 3000 },
  { label: "8s", value: 8, credits: 6000 },
  { label: "16s", value: 16, credits: 12000 },
];

const modes = [
  {
    id: "text-to-video",
    label: "Text to Video",
    description: "Generate video from text description",
    icon: <Film size={20} />,
  },
  {
    id: "image-to-video",
    label: "Image to Video",
    description: "Animate a static image",
    icon: <Sparkles size={20} />,
  },
];

export function VideoGenerator() {
  const [mode, setMode] = useState<"text-to-video" | "image-to-video">(
    "text-to-video"
  );
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const { credits, useCredits } = useAppStore();

  const selectedDuration = durations.find((d) => d.value === duration);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    const requiredCredits = selectedDuration?.credits || 6000;
    if (credits < requiredCredits) {
      alert(`Not enough credits! This video costs ${requiredCredits} credits.`);
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    useCredits(requiredCredits);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    // Simulate generation
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setGeneratedVideo(
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      );
      setIsGenerating(false);
    }, 5000);
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Controls */}
      <div className="w-[400px] border-r border-white/5 flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Mode Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--foreground-muted)]">
              Generation Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              {modes.map((m) => (
                <motion.button
                  key={m.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode(m.id as typeof mode)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    mode === m.id
                      ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10"
                      : "border-white/10 hover:border-white/20"
                  )}
                >
                  <span
                    className={cn(
                      "block mb-2",
                      mode === m.id
                        ? "text-[var(--neon-cyan)]"
                        : "text-[var(--foreground-muted)]"
                    )}
                  >
                    {m.icon}
                  </span>
                  <span className="font-medium text-sm">{m.label}</span>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    {m.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Image Upload (for image-to-video mode) */}
          {mode === "image-to-video" && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-[var(--foreground-muted)]">
                Source Image
              </label>
              {uploadedImage ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              ) : (
                <motion.label
                  whileHover={{ scale: 1.01 }}
                  className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-white/10 hover:border-[var(--neon-cyan)]/30 cursor-pointer transition-colors"
                >
                  <Upload
                    size={32}
                    className="text-[var(--foreground-subtle)] mb-2"
                  />
                  <span className="text-sm text-[var(--foreground-muted)]">
                    Click to upload image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedImage(URL.createObjectURL(file));
                      }
                    }}
                  />
                </motion.label>
              )}
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground-muted)]">
              {mode === "text-to-video"
                ? "Describe your video"
                : "Describe the motion"}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === "text-to-video"
                  ? "A serene lake at sunrise with mist rising from the water..."
                  : "Gentle camera zoom in, clouds moving slowly in the background..."
              }
              rows={4}
              className="input-cyber w-full resize-none"
            />
          </div>

          {/* Duration Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--foreground-muted)]">
              Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {durations.map((d) => (
                <motion.button
                  key={d.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDuration(d.value)}
                  className={cn(
                    "p-3 rounded-xl border text-center transition-all",
                    duration === d.value
                      ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10"
                      : "border-white/10 hover:border-white/20"
                  )}
                >
                  <span className="flex items-center justify-center gap-1 mb-1">
                    <Clock size={14} />
                    <span className="font-medium">{d.label}</span>
                  </span>
                  <span className="text-xs text-[var(--foreground-muted)] flex items-center justify-center gap-1">
                    <Zap size={10} />
                    {d.credits.toLocaleString()}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Model Info */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[var(--neon-purple)] animate-pulse" />
              <span className="text-sm font-medium">Veo 3.1</span>
            </div>
            <p className="text-xs text-[var(--foreground-muted)]">
              Google&apos;s latest video generation model. Creates
              high-quality, cinematic videos from text or images.
            </p>
          </div>
        </div>

        {/* Generate Button */}
        <div className="p-4 border-t border-white/5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={
              !prompt.trim() ||
              isGenerating ||
              (mode === "image-to-video" && !uploadedImage)
            }
            className={cn(
              "w-full btn-primary flex items-center justify-center gap-3 py-4",
              (!prompt.trim() ||
                isGenerating ||
                (mode === "image-to-video" && !uploadedImage)) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Generating Video...</span>
              </>
            ) : (
              <>
                <Video size={20} />
                <span>Generate Video</span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/20 text-xs">
                  <Zap size={12} />
                  {selectedDuration?.credits.toLocaleString()}
                </span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center">
            <motion.div
              className="w-40 h-40 rounded-3xl bg-gradient-to-br from-[var(--neon-purple)]/20 to-[var(--neon-pink)]/20 flex items-center justify-center mb-8 border border-white/5"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Video size={64} className="text-[var(--neon-purple)]" />
            </motion.div>

            <h3 className="text-xl font-semibold mb-2">Generating your video</h3>
            <p className="text-[var(--foreground-muted)] mb-6 text-center max-w-md">
              This may take a minute. Veo 3.1 is creating your {duration}-second
              video...
            </p>

            {/* Progress Bar */}
            <div className="w-64">
              <div className="progress-bar mb-2">
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--foreground-muted)]">
                <span>Processing</span>
                <span>{Math.round(Math.min(progress, 100))}%</span>
              </div>
            </div>

            {/* Stage Indicators */}
            <div className="mt-8 space-y-2 text-sm">
              <div
                className={cn(
                  "flex items-center gap-2",
                  progress > 0
                    ? "text-[var(--neon-cyan)]"
                    : "text-[var(--foreground-subtle)]"
                )}
              >
                {progress > 0 && progress < 30 ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <div
                    className={cn(
                      "w-3.5 h-3.5 rounded-full border-2",
                      progress >= 30
                        ? "bg-[var(--neon-cyan)] border-[var(--neon-cyan)]"
                        : "border-current"
                    )}
                  />
                )}
                Analyzing prompt...
              </div>
              <div
                className={cn(
                  "flex items-center gap-2",
                  progress >= 30
                    ? "text-[var(--neon-cyan)]"
                    : "text-[var(--foreground-subtle)]"
                )}
              >
                {progress >= 30 && progress < 70 ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <div
                    className={cn(
                      "w-3.5 h-3.5 rounded-full border-2",
                      progress >= 70
                        ? "bg-[var(--neon-cyan)] border-[var(--neon-cyan)]"
                        : "border-current"
                    )}
                  />
                )}
                Generating frames...
              </div>
              <div
                className={cn(
                  "flex items-center gap-2",
                  progress >= 70
                    ? "text-[var(--neon-cyan)]"
                    : "text-[var(--foreground-subtle)]"
                )}
              >
                {progress >= 70 && progress < 100 ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <div
                    className={cn(
                      "w-3.5 h-3.5 rounded-full border-2",
                      progress >= 100
                        ? "bg-[var(--neon-cyan)] border-[var(--neon-cyan)]"
                        : "border-current"
                    )}
                  />
                )}
                Rendering video...
              </div>
            </div>
          </div>
        ) : generatedVideo ? (
          <div className="space-y-6">
            {/* Video Player */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10">
              <video
                src={generatedVideo}
                className="w-full h-full object-contain"
                controls
                autoPlay
                loop
                muted
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Generated Video</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {duration}s • Veo 3.1 • {prompt.slice(0, 50)}...
                </p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerate}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Regenerate
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download size={16} />
                  Download
                </motion.button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <motion.div
              className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[var(--neon-purple)]/10 to-[var(--neon-pink)]/10 flex items-center justify-center mb-6 border border-white/5"
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              <Video size={48} className="text-[var(--foreground-subtle)]" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">
              No videos generated yet
            </h3>
            <p className="text-[var(--foreground-muted)] max-w-md">
              Describe your video idea or upload an image to animate, then click
              Generate to create stunning AI videos.
            </p>

            <div className="mt-8 space-y-2">
              <p className="text-sm text-[var(--foreground-subtle)]">
                Try these prompts:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Ocean waves at sunset",
                  "Northern lights dancing",
                  "City timelapse at night",
                ].map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(sample)}
                    className="px-3 py-1.5 rounded-full text-sm border border-white/10 hover:border-[var(--neon-purple)] hover:text-[var(--neon-purple)] transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
