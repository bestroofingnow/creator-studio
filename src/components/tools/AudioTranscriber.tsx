"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Mic,
  Copy,
  Check,
  X,
  FileAudio,
  Clock,
  Users,
  Globe,
  Download,
} from "lucide-react";
import { useAppStore } from "@/store";

const languages = [
  { code: "auto", label: "Auto-detect" },
  { code: "English", label: "English" },
  { code: "Spanish", label: "Spanish" },
  { code: "French", label: "French" },
  { code: "German", label: "German" },
  { code: "Italian", label: "Italian" },
  { code: "Portuguese", label: "Portuguese" },
  { code: "Chinese", label: "Chinese" },
  { code: "Japanese", label: "Japanese" },
  { code: "Korean", label: "Korean" },
  { code: "Arabic", label: "Arabic" },
  { code: "Hindi", label: "Hindi" },
  { code: "Russian", label: "Russian" },
];

export default function AudioTranscriber() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [includeTimestamps, setIncludeTimestamps] = useState(false);
  const [speakerDiarization, setSpeakerDiarization] = useState(false);
  const [metadata, setMetadata] = useState<{
    wordCount?: number;
    estimatedDuration?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { useCredits } = useAppStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/ogg", "audio/webm", "audio/m4a", "audio/aac", "audio/flac"];
    if (!validTypes.some(type => file.type.includes(type.split('/')[1]))) {
      setError("Please upload an audio file (MP3, WAV, OGG, WebM, M4A, AAC, FLAC)");
      return;
    }

    setAudioFile(file);
    setTranscription("");
    setError(null);
    setMetadata(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setAudioData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      setError("Please upload an audio file");
      return;
    }

    setAudioFile(file);
    setTranscription("");
    setError(null);
    setMetadata(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setAudioData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTranscribe = async () => {
    if (!audioData) return;

    setIsTranscribing(true);
    setError(null);
    setTranscription("");

    try {
      const response = await fetch("/api/transcribe/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioData,
          language: selectedLanguage,
          includeTimestamps,
          speakerDiarization,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transcription failed");
      }

      setTranscription(data.transcription);
      setMetadata({
        wordCount: data.wordCount,
        estimatedDuration: data.estimatedDuration,
      });
      if (data.creditsUsed) {
        useCredits(data.creditsUsed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to transcribe audio");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([transcription], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transcription-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearAudio = () => {
    setAudioFile(null);
    setAudioData(null);
    setTranscription("");
    setError(null);
    setMetadata(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
          <Mic className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Audio Transcription</h2>
          <p className="text-sm text-gray-400">Convert speech to text with Gemini</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-4">
          {/* Audio Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {!audioFile ? (
              <motion.div
                onClick={() => fileInputRef.current?.click()}
                className="glass-card p-8 border-2 border-dashed border-gray-600 hover:border-green-500/50 cursor-pointer transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="p-4 rounded-full bg-green-500/20">
                    <Upload className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Upload audio file</p>
                    <p className="text-sm text-gray-400">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">MP3, WAV, OGG, WebM, M4A, FLAC</p>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card p-4 relative">
                <button
                  onClick={clearAudio}
                  className="absolute top-2 right-2 p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <FileAudio className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{audioFile.name}</p>
                    <p className="text-sm text-gray-400">{formatFileSize(audioFile.size)}</p>
                  </div>
                </div>
                {audioData && (
                  <audio controls className="w-full mt-4 rounded-lg">
                    <source src={audioData} type={audioFile.type} />
                  </audio>
                )}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="glass-card p-4 space-y-4">
            <h3 className="font-medium text-white">Transcription Options</h3>

            {/* Language Selection */}
            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="input-field w-full"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeTimestamps}
                  onChange={(e) => setIncludeTimestamps(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500"
                />
                <Clock className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                <span className="text-sm text-gray-400 group-hover:text-gray-300">
                  Include timestamps
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={speakerDiarization}
                  onChange={(e) => setSpeakerDiarization(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500"
                />
                <Users className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                <span className="text-sm text-gray-400 group-hover:text-gray-300">
                  Speaker identification
                </span>
              </label>
            </div>
          </div>

          {/* Transcribe Button */}
          <motion.button
            onClick={handleTranscribe}
            disabled={!audioData || isTranscribing}
            className="btn-primary w-full flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isTranscribing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Transcribing...
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Transcribe Audio
              </>
            )}
          </motion.button>
        </div>

        {/* Results Section */}
        <div className="glass-card p-6 space-y-4 min-h-[400px]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Transcription</h3>
            {transcription && (
              <div className="flex gap-2">
                <motion.button
                  onClick={handleDownload}
                  className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Download as text"
                >
                  <Download className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </motion.button>
              </div>
            )}
          </div>

          {/* Metadata */}
          {metadata && (
            <div className="flex gap-4 text-sm">
              <span className="text-gray-400">
                Words: <span className="text-white">{metadata.wordCount}</span>
              </span>
              <span className="text-gray-400">
                Duration: <span className="text-white">{metadata.estimatedDuration}</span>
              </span>
            </div>
          )}

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
            ) : transcription ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 overflow-auto"
              >
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {transcription}
                </div>
              </motion.div>
            ) : isTranscribing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 gap-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-green-500/30 border-t-green-500 animate-spin" />
                  <Mic className="w-6 h-6 text-green-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-gray-400">Processing audio with Gemini...</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 text-gray-500"
              >
                <FileAudio className="w-12 h-12 mb-4 opacity-50" />
                <p>Upload an audio file to transcribe</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
