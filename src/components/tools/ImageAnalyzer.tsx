"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Scan, Copy, Check, X, Sparkles, Image as ImageIcon } from "lucide-react";
import { useAppStore } from "@/store";

export default function ImageAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { useCredits } = useAppStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setAnalysis("");
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setAnalysis("");
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysis("");

    try {
      const response = await fetch("/api/analyze/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: image,
          prompt: customPrompt || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setAnalysis(data.analysis);
      if (data.creditsUsed) {
        useCredits(data.creditsUsed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearImage = () => {
    setImage(null);
    setAnalysis("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analysisPrompts = [
    { label: "General Analysis", prompt: "Analyze this image in detail. Describe what you see, the style, colors, composition, and any notable elements." },
    { label: "Art Style", prompt: "Identify and describe the art style, techniques, and artistic elements in this image." },
    { label: "Text Extraction", prompt: "Extract and transcribe any text visible in this image." },
    { label: "Object Detection", prompt: "List and describe all objects, people, and elements visible in this image." },
    { label: "Mood & Emotion", prompt: "Analyze the mood, emotion, and atmosphere conveyed by this image." },
    { label: "Technical Details", prompt: "Provide technical analysis including composition, lighting, color palette, and photographic techniques." },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
          <Scan className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Image Analysis</h2>
          <p className="text-sm text-gray-400">Analyze images with Gemini Vision AI</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-4">
          {/* Image Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {!image ? (
              <motion.div
                onClick={() => fileInputRef.current?.click()}
                className="glass-card p-8 border-2 border-dashed border-gray-600 hover:border-purple-500/50 cursor-pointer transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="p-4 rounded-full bg-purple-500/20">
                    <Upload className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Drop an image here</p>
                    <p className="text-sm text-gray-400">or click to browse</p>
                  </div>
                  <p className="text-xs text-gray-500">Supports JPG, PNG, GIF, WebP</p>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card p-4 relative">
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                <img
                  src={image}
                  alt="Uploaded"
                  className="w-full h-64 object-contain rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Custom Prompt */}
          <div className="glass-card p-4 space-y-3">
            <label className="text-sm font-medium text-gray-300">Analysis Prompt (Optional)</label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter a custom prompt or select a preset below..."
              className="input-field w-full h-24 resize-none"
            />

            {/* Preset Prompts */}
            <div className="flex flex-wrap gap-2">
              {analysisPrompts.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setCustomPrompt(preset.prompt)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    customPrompt === preset.prompt
                      ? "bg-purple-500/30 border-purple-500 text-purple-300"
                      : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <motion.button
            onClick={handleAnalyze}
            disabled={!image || isAnalyzing}
            className="btn-primary w-full flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze Image
              </>
            )}
          </motion.button>
        </div>

        {/* Results Section */}
        <div className="glass-card p-6 space-y-4 min-h-[400px]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Analysis Results</h3>
            {analysis && (
              <motion.button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </motion.button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400"
              >
                {error}
              </motion.div>
            ) : analysis ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-invert max-w-none"
              >
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {analysis}
                </div>
              </motion.div>
            ) : isAnalyzing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 gap-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                  <Scan className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-gray-400">Analyzing image with Gemini Vision...</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 text-gray-500"
              >
                <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                <p>Upload an image to analyze</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
