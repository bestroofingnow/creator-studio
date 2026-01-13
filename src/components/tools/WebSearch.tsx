"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Globe,
  Newspaper,
  BookOpen,
  HelpCircle,
  Scale,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/store";

const searchTypes = [
  { id: "general", label: "General", icon: Globe, description: "Comprehensive search" },
  { id: "news", label: "News", icon: Newspaper, description: "Latest news" },
  { id: "research", label: "Research", icon: BookOpen, description: "Academic & deep dive" },
  { id: "howto", label: "How-To", icon: HelpCircle, description: "Instructions & guides" },
  { id: "comparison", label: "Compare", icon: Scale, description: "Compare options" },
];

interface SearchSource {
  title: string;
  url: string;
  snippet: string;
}

export default function WebSearch() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("general");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{
    summary: string;
    sources: SearchSource[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { useCredits } = useAppStore();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/search/web", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          searchType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResults({
        summary: data.summary,
        sources: data.sources || [],
      });
      if (data.creditsUsed) {
        useCredits(data.creditsUsed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = async () => {
    if (!results) return;
    await navigator.clipboard.writeText(results.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const sampleQueries = [
    "What are the latest AI developments in 2024?",
    "How to create a successful YouTube channel?",
    "Best practices for React performance optimization",
    "Compare ChatGPT vs Claude vs Gemini",
    "Latest news on renewable energy",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30">
          <Search className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Web Search</h2>
          <p className="text-sm text-gray-400">Search the web with Gemini grounding</p>
        </div>
      </div>

      {/* Search Type Selection */}
      <div className="glass-card p-4">
        <label className="text-sm font-medium text-gray-300 mb-3 block">Search Type</label>
        <div className="flex flex-wrap gap-2">
          {searchTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSearchType(type.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  searchType === type.id
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                    : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      <div className="glass-card p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What would you like to search for?"
            className="input-field w-full pl-12 pr-4 py-3"
          />
        </div>

        {/* Sample Queries */}
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(sample)}
              className="px-3 py-1.5 text-xs rounded-full bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600 transition-colors truncate max-w-[200px]"
              title={sample}
            >
              {sample.length > 30 ? sample.substring(0, 30) + "..." : sample}
            </button>
          ))}
        </div>

        {/* Search Button */}
        <motion.button
          onClick={handleSearch}
          disabled={!query.trim() || isSearching}
          className="btn-primary w-full flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSearching ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Search with AI
            </>
          )}
        </motion.button>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card p-6"
          >
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400">
              {error}
            </div>
          </motion.div>
        ) : results ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Search Results
                </h3>
                <motion.button
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </motion.button>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {results.summary}
                </div>
              </div>
            </div>

            {/* Sources */}
            {results.sources.length > 0 && (
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  Sources ({results.sources.length})
                </h3>
                <div className="grid gap-3">
                  {results.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-gray-600 transition-colors group"
                    >
                      <div className="flex-shrink-0 p-2 rounded-lg bg-cyan-500/20">
                        <ExternalLink className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium group-hover:text-cyan-300 transition-colors truncate">
                          {source.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{source.url}</p>
                        {source.snippet && (
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{source.snippet}</p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : isSearching ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12"
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin" />
                <Search className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-gray-400">Searching the web with Gemini AI...</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12"
          >
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Globe className="w-12 h-12 mb-4 opacity-50" />
              <p>Enter a search query to get AI-powered results</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
