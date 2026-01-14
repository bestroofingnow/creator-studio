"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  MessageSquare,
  Image,
  Video,
  Mic,
  AudioLines,
  Search,
  Wand2,
  Zap,
  Shield,
  ArrowRight,
  Check,
  Play,
  Star,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description: "Intelligent conversation powered by Gemini 2.0 for content brainstorming and creation",
    color: "var(--neon-cyan)",
  },
  {
    icon: Image,
    title: "Image Generation",
    description: "Create stunning visuals with Imagen 3.0 in multiple styles and aspect ratios",
    color: "var(--neon-purple)",
  },
  {
    icon: Video,
    title: "Video Generation",
    description: "Generate professional videos up to 8 seconds with Veo 2 AI technology",
    color: "var(--neon-pink)",
  },
  {
    icon: Wand2,
    title: "Image Editing",
    description: "Transform and edit images with AI-powered tools for perfect results",
    color: "var(--neon-orange)",
  },
  {
    icon: Mic,
    title: "Speech Generation",
    description: "Convert text to natural-sounding speech with customizable voices",
    color: "var(--neon-green)",
  },
  {
    icon: AudioLines,
    title: "Audio Transcription",
    description: "Accurately transcribe audio files with speaker detection and timestamps",
    color: "var(--neon-blue)",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    credits: "1,000",
    features: ["Access to all AI tools", "1,000 starter credits", "Basic support"],
    popular: false,
  },
  {
    name: "Starter",
    price: "29",
    credits: "25,000",
    features: ["25,000 credits/month", "Priority support", "Early access to features"],
    popular: false,
  },
  {
    name: "Pro",
    price: "79",
    credits: "100,000",
    features: ["100,000 credits/month", "Priority support", "API access", "Custom branding"],
    popular: true,
  },
  {
    name: "Business",
    price: "199",
    credits: "500,000",
    features: ["500,000 credits/month", "Dedicated support", "Team collaboration", "White-label options"],
    popular: false,
  },
];

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Creator Studio</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[var(--foreground-muted)] hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-[var(--foreground-muted)] hover:text-white transition-colors">Pricing</a>
              <Link href="/pricing" className="text-[var(--foreground-muted)] hover:text-white transition-colors">Plans</Link>
            </div>

            <div className="flex items-center gap-3">
              {session ? (
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary"
                  >
                    Go to Dashboard
                  </motion.button>
                </Link>
              ) : (
                <>
                  <Link href="/signin" className="hidden sm:block text-[var(--foreground-muted)] hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary"
                    >
                      Get Started Free
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--neon-cyan)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--neon-purple)]/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--neon-cyan)]/10 border border-[var(--neon-cyan)]/20 mb-8"
            >
              <Zap className="w-4 h-4 text-[var(--neon-cyan)]" />
              <span className="text-sm text-[var(--neon-cyan)]">Powered by Google Gemini & Imagen AI</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gradient">Create Amazing Content</span>
              <br />
              <span className="text-white">With AI-Powered Tools</span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--foreground-muted)] max-w-2xl mx-auto mb-10">
              Generate images, videos, audio, and more with cutting-edge AI technology.
              Your complete content creation studio powered by voice control.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                >
                  Start Creating Free
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 flex items-center gap-2 transition-colors"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </motion.button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 mt-12 text-[var(--foreground-muted)]">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--neon-green)]" />
                <span className="text-sm">Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[var(--neon-orange)]" />
                <span className="text-sm">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[var(--neon-cyan)]" />
                <span className="text-sm">No Credit Card Required</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Image/Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="glass-card p-2 rounded-2xl overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background)] rounded-xl flex items-center justify-center border border-white/5">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-[var(--foreground-muted)]">Your AI-Powered Creative Studio</p>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[var(--neon-cyan)]/20 via-[var(--neon-purple)]/20 to-[var(--neon-pink)]/20 rounded-3xl blur-2xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-gradient">Powerful AI Tools</span>
            </h2>
            <p className="text-[var(--foreground-muted)] max-w-2xl mx-auto">
              Everything you need to create stunning content, all in one place.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:border-white/10 transition-colors group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--foreground-muted)] text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Additional Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 glass-card p-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="w-6 h-6 text-[var(--neon-cyan)]" />
                  <h3 className="text-xl font-semibold">Web Search Integration</h3>
                </div>
                <p className="text-[var(--foreground-muted)] mb-4">
                  Research and gather information from the web with AI-powered search capabilities.
                  Get accurate, up-to-date information for your content creation needs.
                </p>
                <ul className="space-y-2">
                  {["Real-time web search", "Source verification", "Content summarization"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                      <Check className="w-4 h-4 text-[var(--neon-green)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-[var(--neon-cyan)]/10 to-[var(--neon-purple)]/10 flex items-center justify-center border border-white/5">
                  <Search className="w-16 h-16 text-[var(--neon-cyan)]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-[var(--background-secondary)]/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-gradient">Simple, Transparent Pricing</span>
            </h2>
            <p className="text-[var(--foreground-muted)] max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card p-6 relative ${plan.popular ? "border-[var(--neon-cyan)]/50" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--neon-cyan)] rounded-full text-xs font-medium text-black">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-[var(--foreground-muted)]">/month</span>
                </div>
                <p className="text-sm text-[var(--neon-cyan)] mb-6">{plan.credits} credits</p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                      <Check className="w-4 h-4 text-[var(--neon-green)]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={plan.price === "0" ? "/register" : "/pricing"}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      plan.popular
                        ? "btn-primary"
                        : "border border-white/10 hover:border-white/20"
                    }`}
                  >
                    {plan.price === "0" ? "Get Started" : "Subscribe"}
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 sm:p-12 text-center relative overflow-hidden"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--neon-cyan)]/5 via-transparent to-[var(--neon-purple)]/5" />

            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to Create Amazing Content?
              </h2>
              <p className="text-[var(--foreground-muted)] mb-8 max-w-lg mx-auto">
                Join thousands of creators using AI to produce stunning content.
                Start with 1,000 free credits today.
              </p>
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
                >
                  Create Your Free Account
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">Creator Studio</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-[var(--foreground-muted)]">
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <Link href="/signin" className="hover:text-white transition-colors">Sign In</Link>
            </div>

            <p className="text-sm text-[var(--foreground-muted)]">
              &copy; {new Date().getFullYear()} Creator Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Orbs (Decorative) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0, 240, 255, 0.05) 0%, transparent 70%)",
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
            background: "radial-gradient(circle, rgba(191, 0, 255, 0.05) 0%, transparent 70%)",
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
