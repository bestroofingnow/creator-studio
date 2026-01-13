"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  credits: string;
  color?: "cyan" | "purple" | "pink" | "green" | "orange";
  onClick?: () => void;
  className?: string;
}

const colorClasses = {
  cyan: "from-[var(--neon-cyan)]/20 to-[var(--neon-blue)]/20",
  purple: "from-[var(--neon-purple)]/20 to-[var(--neon-pink)]/20",
  pink: "from-[var(--neon-pink)]/20 to-[var(--neon-orange)]/20",
  green: "from-[var(--neon-green)]/20 to-[var(--neon-cyan)]/20",
  orange: "from-[var(--neon-orange)]/20 to-[var(--neon-yellow)]/20",
};

const iconColorClasses = {
  cyan: "text-[var(--neon-cyan)]",
  purple: "text-[var(--neon-purple)]",
  pink: "text-[var(--neon-pink)]",
  green: "text-[var(--neon-green)]",
  orange: "text-[var(--neon-orange)]",
};

export function ToolCard({
  icon,
  title,
  description,
  credits,
  color = "cyan",
  onClick,
  className,
}: ToolCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn("tool-card cursor-pointer group", className)}
    >
      {/* Icon */}
      <div
        className={cn(
          "tool-icon bg-gradient-to-br",
          colorClasses[color]
        )}
      >
        <span className={iconColorClasses[color]}>{icon}</span>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold mb-1 group-hover:text-[var(--neon-cyan)] transition-colors">
        {title}
      </h3>
      <p className="text-sm text-[var(--foreground-muted)] mb-4">
        {description}
      </p>

      {/* Credits */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--foreground-subtle)]">
          Credits per use
        </span>
        <span className="text-sm font-semibold text-[var(--neon-cyan)]">
          {credits}
        </span>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-[var(--neon-cyan)]/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
