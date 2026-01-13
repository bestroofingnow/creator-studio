"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AuthGateProps {
  children: React.ReactNode;
  featureName?: string;
}

export function AuthGate({ children, featureName = "this feature" }: AuthGateProps) {
  const { status } = useSession();

  // Show loading state briefly
  if (status === "loading") {
    return <>{children}</>;
  }

  // If authenticated, render children normally
  if (status === "authenticated") {
    return <>{children}</>;
  }

  // If not authenticated, show overlay with sign-up CTA
  return (
    <div className="relative h-full">
      {/* Blurred preview of the feature */}
      <div className="h-full opacity-50 blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Sign up overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center p-8 max-w-md"
        >
          {/* Icon */}
          <motion.div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center mx-auto mb-6"
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
            <Lock size={36} className="text-black" />
          </motion.div>

          {/* Title */}
          <h3 className="text-2xl font-bold mb-3 text-gradient">
            Unlock {featureName}
          </h3>

          {/* Description */}
          <p className="text-[var(--foreground-muted)] mb-6">
            Sign up for free to access all Creator Studio features including AI chat,
            image generation, video creation, and more.
          </p>

          {/* Benefits */}
          <div className="flex flex-col gap-2 mb-8 text-sm text-left">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Sparkles size={18} className="text-[var(--neon-cyan)]" />
              <span>1,000 free credits to start</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Sparkles size={18} className="text-[var(--neon-purple)]" />
              <span>Access to all AI tools</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Sparkles size={18} className="text-[var(--neon-pink)]" />
              <span>No credit card required</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Link href="/login?signup=true">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4"
              >
                Sign Up Free
                <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-secondary flex items-center justify-center gap-2 py-3"
              >
                Already have an account? Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
