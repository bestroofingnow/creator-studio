"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Wand2,
  Download,
  X,
  Sparkles,
  ImageIcon,
  Palette,
  Eraser,
  PlusCircle,
  Maximize,
  RefreshCw,
  Layers,
} from "lucide-react";
import { useAppStore } from "@/store";

const editTypes = [
  { id: "general", label: "General Edit", icon: Wand2, description: "Apply any edit" },
  { id: "background", label: "Background", icon: Layers, description: "Change background" },
  { id: "style", label: "Style Transfer", icon: Palette, description: "Apply artistic style" },
  { id: "enhance", label: "Enhance", icon: Sparkles, description: "Improve quality" },
  { id: "remove", label: "Remove", icon: Eraser, description: "Remove elements" },
  { id: "add", label: "Add Element", icon: PlusCircle, description: "Add new elements" },
  { id: "colorize", label: "Colorize", icon: Palette, description: "Change colors" },
  { id: "upscale", label: "Upscale", icon: Maximize, description: "Increase resolution" },
];

export default function ImageEditor() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [selectedEditType, setSelectedEditType] = useState("general");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
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
      setOriginalImage(event.target?.result as string);
      setEditedImage(null);
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
      setOriginalImage(event.target?.result as string);
      setEditedImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = async () => {
    if (!originalImage || !editPrompt.trim()) return;

    setIsEditing(true);
    setError(null);
    setEditedImage(null);

    try {
      const response = await fetch("/api/edit/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: originalImage,
          editPrompt: editPrompt,
          editType: selectedEditType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Edit failed");
      }

      setEditedImage(data.editedImage);
      if (data.creditsUsed) {
        useCredits(data.creditsUsed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to edit image");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDownload = () => {
    if (!editedImage) return;

    const link = document.createElement("a");
    link.href = editedImage;
    link.download = `edited-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearImages = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setError(null);
    setEditPrompt("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const promptSuggestions: Record<string, string[]> = {
    general: ["Make it look more professional", "Add a vintage film look", "Make it more vibrant"],
    background: ["Replace with a beach sunset", "Add a blurred city background", "Make it a studio backdrop"],
    style: ["Oil painting style", "Anime/manga style", "Watercolor effect"],
    enhance: ["Increase sharpness and clarity", "Improve lighting and exposure", "Enhance colors naturally"],
    remove: ["Remove the background", "Remove any text or watermarks", "Remove unwanted objects"],
    add: ["Add soft lighting effects", "Add dramatic clouds to the sky", "Add subtle lens flare"],
    colorize: ["Make it black and white", "Add a warm golden tone", "Apply a cool blue tint"],
    upscale: ["Upscale 2x with enhanced details", "Improve resolution and sharpness", "Restore and enhance quality"],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
          <Wand2 className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Image Editor</h2>
          <p className="text-sm text-gray-400">Edit and transform images with AI</p>
        </div>
      </div>

      {/* Edit Type Selection */}
      <div className="glass-card p-4">
        <label className="text-sm font-medium text-gray-300 mb-3 block">Edit Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {editTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedEditType(type.id)}
                className={`p-3 rounded-xl border transition-all ${
                  selectedEditType === type.id
                    ? "bg-orange-500/20 border-orange-500 text-orange-300"
                    : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <p className="text-xs font-medium">{type.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload & Edit Section */}
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

            {!originalImage ? (
              <motion.div
                onClick={() => fileInputRef.current?.click()}
                className="glass-card p-8 border-2 border-dashed border-gray-600 hover:border-orange-500/50 cursor-pointer transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="p-4 rounded-full bg-orange-500/20">
                    <Upload className="w-8 h-8 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Upload image to edit</p>
                    <p className="text-sm text-gray-400">or drag and drop</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card p-4 relative">
                <button
                  onClick={clearImages}
                  className="absolute top-2 right-2 p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-gray-400 mb-2">Original Image</p>
                <img
                  src={originalImage}
                  alt="Original"
                  className="w-full h-48 object-contain rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Edit Prompt */}
          <div className="glass-card p-4 space-y-3">
            <label className="text-sm font-medium text-gray-300">Edit Instructions</label>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="Describe how you want to edit this image..."
              className="input-field w-full h-24 resize-none"
            />

            {/* Prompt Suggestions */}
            <div className="flex flex-wrap gap-2">
              {promptSuggestions[selectedEditType]?.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setEditPrompt(suggestion)}
                  className="px-3 py-1.5 text-xs rounded-full bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Edit Button */}
          <motion.button
            onClick={handleEdit}
            disabled={!originalImage || !editPrompt.trim() || isEditing}
            className="btn-primary w-full flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isEditing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Processing Edit...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Apply Edit
              </>
            )}
          </motion.button>
        </div>

        {/* Result Section */}
        <div className="glass-card p-6 space-y-4 min-h-[400px]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Edited Result</h3>
            {editedImage && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <motion.button
                  onClick={handleDownload}
                  className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4" />
                </motion.button>
              </div>
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
            ) : editedImage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {showComparison && originalImage ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Before</p>
                      <img src={originalImage} alt="Before" className="w-full h-48 object-contain rounded-lg" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-2">After</p>
                      <img src={editedImage} alt="After" className="w-full h-48 object-contain rounded-lg" />
                    </div>
                  </div>
                ) : (
                  <img src={editedImage} alt="Edited" className="w-full h-64 object-contain rounded-lg" />
                )}
              </motion.div>
            ) : isEditing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 gap-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
                  <Wand2 className="w-6 h-6 text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-gray-400">Applying AI edits...</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 text-gray-500"
              >
                <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                <p>Upload an image and describe your edit</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
