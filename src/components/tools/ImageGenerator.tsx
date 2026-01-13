"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Download,
  Copy,
  RefreshCw,
  Maximize2,
  Settings2,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  ChevronDown,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";

const aspectRatios = [
  { label: "1:1", value: "1:1", width: "Square" },
  { label: "16:9", value: "16:9", width: "Landscape" },
  { label: "9:16", value: "9:16", width: "Portrait" },
  { label: "4:3", value: "4:3", width: "Standard" },
  { label: "3:4", value: "3:4", width: "Portrait" },
];

const styles = [
  { label: "Photorealistic", value: "photorealistic" },
  { label: "Digital Art", value: "digital-art" },
  { label: "Anime", value: "anime" },
  { label: "Oil Painting", value: "oil-painting" },
  { label: "Watercolor", value: "watercolor" },
  { label: "3D Render", value: "3d-render" },
  { label: "Sketch", value: "sketch" },
  { label: "Cyberpunk", value: "cyberpunk" },
];

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [style, setStyle] = useState("photorealistic");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const { credits, useCredits } = useAppStore();

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    // Check credits
    if (credits < 600) {
      alert("Not enough credits! Image generation costs 600 credits.");
      return;
    }

    setIsGenerating(true);
    useCredits(600);

    // Simulate generation (replace with actual API call)
    setTimeout(() => {
      // Add placeholder images for demo
      setGeneratedImages([
        "https://picsum.photos/seed/ai1/512/512",
        "https://picsum.photos/seed/ai2/512/512",
        "https://picsum.photos/seed/ai3/512/512",
        "https://picsum.photos/seed/ai4/512/512",
      ]);
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Controls */}
      <div className="w-[400px] border-r border-white/5 flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground-muted)]">
              Describe your image
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city at sunset with flying cars..."
              rows={4}
              className="input-cyber w-full resize-none"
            />
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--foreground-muted)]">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-5 gap-2">
              {aspectRatios.map((ratio) => (
                <motion.button
                  key={ratio.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAspectRatio(ratio.value)}
                  className={cn(
                    "p-3 rounded-xl border text-center transition-all",
                    aspectRatio === ratio.value
                      ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)]"
                      : "border-white/10 hover:border-white/20"
                  )}
                >
                  <span className="text-sm font-medium">{ratio.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Style Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--foreground-muted)]">
              Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {styles.map((s) => (
                <motion.button
                  key={s.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStyle(s.value)}
                  className={cn(
                    "p-3 rounded-xl border text-sm transition-all",
                    style === s.value
                      ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)]"
                      : "border-white/10 hover:border-white/20"
                  )}
                >
                  {s.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-3">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <Settings2 size={16} />
              <span>Advanced Settings</span>
              <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }}>
                <ChevronDown size={16} />
              </motion.div>
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* Negative Prompt */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground-muted)]">
                      Negative Prompt
                    </label>
                    <textarea
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="Things to avoid: blurry, low quality..."
                      rows={2}
                      className="input-cyber w-full resize-none text-sm"
                    />
                  </div>

                  {/* Number of Images */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground-muted)]">
                      Number of Images
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 4].map((num) => (
                        <button
                          key={num}
                          className="flex-1 p-2 rounded-lg border border-white/10 hover:border-[var(--neon-cyan)] text-sm transition-colors"
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Generate Button */}
        <div className="p-4 border-t border-white/5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={cn(
              "w-full btn-primary flex items-center justify-center gap-3 py-4",
              (!prompt.trim() || isGenerating) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 size={20} />
                <span>Generate Image</span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/20 text-xs">
                  <Zap size={12} />
                  600
                </span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 p-6 overflow-y-auto">
        {generatedImages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <motion.div
              className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[var(--neon-cyan)]/10 to-[var(--neon-purple)]/10 flex items-center justify-center mb-6 border border-white/5"
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              <ImageIcon size={48} className="text-[var(--foreground-subtle)]" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">No images generated yet</h3>
            <p className="text-[var(--foreground-muted)] max-w-md">
              Enter a description of the image you want to create and click
              Generate to see your AI-generated artwork here.
            </p>

            {/* Sample Prompts */}
            <div className="mt-8 space-y-2">
              <p className="text-sm text-[var(--foreground-subtle)]">
                Try these prompts:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "A cosmic dragon in space",
                  "Cyberpunk city at night",
                  "Magical forest with glowing mushrooms",
                ].map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(sample)}
                    className="px-3 py-1.5 rounded-full text-sm border border-white/10 hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)] transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Generation Info */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Generated Images</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {prompt.slice(0, 50)}...
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Regenerate
              </motion.button>
            </div>

            {/* Image Grid */}
            {isGenerating ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden"
                  >
                    <div className="shimmer w-full h-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 hover:border-[var(--neon-cyan)]/30 transition-colors"
                  >
                    <img
                      src={img}
                      alt={`Generated ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                          >
                            <Download size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                          >
                            <Copy size={18} />
                          </motion.button>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                        >
                          <Maximize2 size={18} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs">
                      {index + 1}/4
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
