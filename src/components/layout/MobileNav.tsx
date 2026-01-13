"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  Image,
  Video,
  Mic,
  MoreHorizontal,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppStore, type Tool } from "@/store";

interface NavItem {
  id: Tool | "more" | "account";
  label: string;
  icon: React.ReactNode;
}

const mobileNavItems: NavItem[] = [
  { id: "chat", label: "Chat", icon: <MessageSquare size={20} /> },
  { id: "image-generate", label: "Image", icon: <Image size={20} /> },
  { id: "video-generate", label: "Video", icon: <Video size={20} /> },
  { id: "speech-generate", label: "Audio", icon: <Mic size={20} /> },
  { id: "account", label: "Account", icon: <User size={20} /> },
];

export function MobileNav() {
  const { currentTool, setCurrentTool } = useAppStore();
  const { data: session } = useSession();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--background)]/95 backdrop-blur-xl border-t border-white/10 z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const isActive = item.id === currentTool;
          const isAccount = item.id === "account";

          if (isAccount) {
            return (
              <Link
                key={item.id}
                href={session ? "/account" : "/login"}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]",
                  "text-[var(--foreground-muted)]"
                )}
              >
                <span className="relative">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    item.icon
                  )}
                </span>
                <span className="text-[10px] font-medium">
                  {session ? "Account" : "Sign In"}
                </span>
              </Link>
            );
          }

          return (
            <motion.button
              key={item.id}
              onClick={() => setCurrentTool(item.id as Tool)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]",
                isActive
                  ? "text-[var(--neon-cyan)]"
                  : "text-[var(--foreground-muted)]"
              )}
              whileTap={{ scale: 0.9 }}
            >
              <span className="relative">
                {item.icon}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--neon-cyan)]"
                  />
                )}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
