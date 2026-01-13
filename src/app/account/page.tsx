"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  CreditCard,
  Zap,
  Crown,
  Sparkles,
  LogOut,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface UserData {
  credits: number;
  subscriptionTier: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
}

const tierConfig: Record<string, { name: string; icon: React.ReactNode; color: string; credits: number }> = {
  free: { name: "Free", icon: <User className="w-5 h-5" />, color: "gray", credits: 1000 },
  starter: { name: "Starter", icon: <Zap className="w-5 h-5" />, color: "cyan", credits: 25000 },
  pro: { name: "Pro", icon: <Sparkles className="w-5 h-5" />, color: "purple", credits: 100000 },
  business: { name: "Business", icon: <Crown className="w-5 h-5" />, color: "pink", credits: 500000 },
};

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const showSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/account");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/credits");
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setPortalLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--neon-cyan)]" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const tier = userData?.subscriptionTier || "free";
  const config = tierConfig[tier] || tierConfig.free;
  const maxCredits = config.credits;
  const currentCredits = userData?.credits || 0;
  const creditPercentage = Math.min((currentCredits / maxCredits) * 100, 100);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[var(--foreground-muted)] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Studio</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-[var(--foreground-muted)] hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400">
              Subscription activated successfully! Your credits have been added.
            </span>
          </motion.div>
        )}

        <h1 className="text-3xl font-bold mb-8">Account</h1>

        <div className="grid gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--foreground-muted)]" />
              Profile
            </h2>
            <div className="flex items-center gap-4">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[var(--neon-purple)]/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-[var(--neon-purple)]" />
                </div>
              )}
              <div>
                <p className="font-semibold">{session.user?.name || "User"}</p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {session.user?.email}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[var(--foreground-muted)]" />
              Subscription
            </h2>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    config.color === "cyan"
                      ? "bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)]"
                      : config.color === "purple"
                      ? "bg-[var(--neon-purple)]/20 text-[var(--neon-purple)]"
                      : config.color === "pink"
                      ? "bg-[var(--neon-pink)]/20 text-[var(--neon-pink)]"
                      : "bg-white/10 text-[var(--foreground-muted)]"
                  }`}
                >
                  {config.icon}
                </div>
                <div>
                  <p className="font-semibold">{config.name} Plan</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {userData?.subscriptionStatus === "active"
                      ? "Active subscription"
                      : "No active subscription"}
                  </p>
                </div>
              </div>

              {tier === "free" ? (
                <Link href="/pricing" className="btn-primary text-sm">
                  Upgrade
                </Link>
              ) : (
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Manage"
                  )}
                </button>
              )}
            </div>

            {userData?.currentPeriodEnd && (
              <p className="text-sm text-[var(--foreground-muted)]">
                Next billing date:{" "}
                {new Date(userData.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </motion.div>

          {/* Credits Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[var(--foreground-muted)]" />
              Credits
            </h2>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">
                  {currentCredits.toLocaleString()}
                </span>
                <span className="text-sm text-[var(--foreground-muted)]">
                  of {maxCredits.toLocaleString()}
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${creditPercentage}%` }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] rounded-full"
                />
              </div>
            </div>

            <p className="text-sm text-[var(--foreground-muted)]">
              Credits refresh monthly with your subscription.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
