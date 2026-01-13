"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Play,
  Pause,
  Download,
  RefreshCw,
  Sparkles,
  Square,
  Settings,
} from "lucide-react";
import { useAppStore } from "@/store";

const voices = [
  { id: "Kore", name: "Kore", description: "Warm & friendly" },
  { id: "Charon", name: "Charon", description: "Deep & authoritative" },
  { id: "Fenrir", name: "Fenrir", description: "Energetic & dynamic" },
  { id: "Aoede", name: "Aoede", description: "Clear & professional" },
  { id: "Puck", name: "Puck", description: "Playful & expressive" },
  { id: "Orbit", name: "Orbit", description: "Calm & soothing" },
];

export default function SpeechGenerator() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("Kore");
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useBrowserTTS, setUseBrowserTTS] = useState(false);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedBrowserVoice, setSelectedBrowserVoice] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const { useCredits } = useAppStore();

  // Load browser voices
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis?.getVoices() || [];
      setBrowserVoices(available);
      if (available.length > 0 && !selectedBrowserVoice) {
        const defaultVoice = available.find(v => v.default) || available[0];
        setSelectedBrowserVoice(defaultVoice.name);
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedBrowserVoice]);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    if (useBrowserTTS) {
      handleBrowserTTS();
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch("/api/generate/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          speed,
          pitch,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If API TTS not available, offer browser TTS
        if (response.status === 503) {
          setError("Cloud TTS not available. Try browser TTS below.");
          setUseBrowserTTS(true);
          return;
        }
        throw new Error(data.error || "Generation failed");
      }

      setAudioUrl(data.audioUrl);
      if (data.creditsUsed) {
        useCredits(data.creditsUsed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate speech");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBrowserTTS = () => {
    if (!text.trim() || typeof window === 'undefined') return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = browserVoices.find(v => v.name === selectedBrowserVoice);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = speed;
    utterance.pitch = 1 + (pitch / 10);

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      setError("Browser speech synthesis failed");
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (useBrowserTTS) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        handleBrowserTTS();
      }
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStop = () => {
    if (useBrowserTTS) {
      window.speechSynthesis.cancel();
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleDownload = () => {
    if (!audioUrl) return;

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `speech-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const characterCount = text.length;
  const maxCharacters = 5000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30">
          <Volume2 className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Speech Generator</h2>
          <p className="text-sm text-gray-400">Convert text to natural speech</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-white">Speech Engine</h3>
            <p className="text-sm text-gray-400">Choose your text-to-speech engine</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setUseBrowserTTS(false)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                !useBrowserTTS
                  ? "bg-blue-500/30 border border-blue-500 text-blue-300"
                  : "bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600"
              }`}
            >
              Cloud AI
            </button>
            <button
              onClick={() => setUseBrowserTTS(true)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                useBrowserTTS
                  ? "bg-blue-500/30 border border-blue-500 text-blue-300"
                  : "bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600"
              }`}
            >
              Browser TTS
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Text Input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Text to Speak</label>
              <span className={`text-xs ${characterCount > maxCharacters ? "text-red-400" : "text-gray-500"}`}>
                {characterCount} / {maxCharacters}
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, maxCharacters))}
              placeholder="Enter the text you want to convert to speech..."
              className="input-field w-full h-48 resize-none"
            />

            {/* Quick Samples */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setText("Welcome to Creator Studio, your all-in-one platform for AI-powered content creation.")}
                className="px-3 py-1.5 text-xs rounded-full bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600 transition-colors"
              >
                Sample: Welcome
              </button>
              <button
                onClick={() => setText("Breaking news! Scientists have discovered a remarkable new species in the depths of the ocean.")}
                className="px-3 py-1.5 text-xs rounded-full bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600 transition-colors"
              >
                Sample: News
              </button>
              <button
                onClick={() => setText("In a land far away, there lived a curious inventor who dreamed of building machines that could think and feel.")}
                className="px-3 py-1.5 text-xs rounded-full bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600 transition-colors"
              >
                Sample: Story
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <motion.button
            onClick={handleGenerate}
            disabled={!text.trim() || isGenerating}
            className="btn-primary w-full flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating Speech...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Speech
              </>
            )}
          </motion.button>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Audio Player */}
          <AnimatePresence>
            {(audioUrl || (useBrowserTTS && text)) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Audio Player</h3>
                  {audioUrl && !useBrowserTTS && (
                    <motion.button
                      onClick={handleDownload}
                      className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>

                {!useBrowserTTS && audioUrl && (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                )}

                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={handlePlay}
                    className="p-4 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </motion.button>
                  <motion.button
                    onClick={handleStop}
                    className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Square className="w-4 h-4" />
                  </motion.button>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">
                      {isPlaying ? "Playing..." : "Ready to play"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {useBrowserTTS ? "Browser TTS" : "Cloud AI Voice"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <div className="glass-card p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-400" />
              <h3 className="font-medium text-white">Voice Settings</h3>
            </div>

            {/* Voice Selection */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Voice</label>
              {useBrowserTTS ? (
                <select
                  value={selectedBrowserVoice}
                  onChange={(e) => setSelectedBrowserVoice(e.target.value)}
                  className="input-field w-full"
                >
                  {browserVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-2">
                  {voices.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedVoice === voice.id
                          ? "bg-blue-500/20 border border-blue-500"
                          : "bg-gray-800/50 border border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <p className={`font-medium ${selectedVoice === voice.id ? "text-blue-300" : "text-white"}`}>
                        {voice.name}
                      </p>
                      <p className="text-xs text-gray-500">{voice.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Speed */}
            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center justify-between">
                <span>Speed</span>
                <span className="text-white">{speed.toFixed(1)}x</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Pitch */}
            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center justify-between">
                <span>Pitch</span>
                <span className="text-white">{pitch > 0 ? `+${pitch}` : pitch}</span>
              </label>
              <input
                type="range"
                min="-5"
                max="5"
                step="1"
                value={pitch}
                onChange={(e) => setPitch(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>

          {/* Info Card */}
          <div className="glass-card p-4">
            <h4 className="font-medium text-white mb-2">Tips</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>Use punctuation for natural pauses</li>
              <li>Add emphasis with CAPS or *asterisks*</li>
              <li>Numbers are spoken as words</li>
              <li>Browser TTS is free and instant</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
