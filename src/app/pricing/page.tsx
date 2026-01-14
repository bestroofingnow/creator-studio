"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, Loader2 } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    tier: "starter",
    price: 29,
    credits: "25,000",
    description: "Perfect for individuals and small projects",
    icon: <Zap className="w-6 h-6" />,
    color: "cyan",
    features: [
      "25,000 credits/month",
      "All AI tools access",
      "Image & video generation",
      "Speech synthesis",
      "Email support",
    ],
  },
  {
    name: "Pro",
    tier: "pro",
    price: 79,
    credits: "100,000",
    description: "For professionals and growing teams",
    icon: <Sparkles className="w-6 h-6" />,
    color: "purple",
    popular: true,
    features: [
      "100,000 credits/month",
      "All AI tools access",
      "Priority processing",
      "HD video generation",
      "Priority support",
    ],
  },
  {
    name: "Business",
    tier: "business",
    price: 199,
    credits: "500,000",
    description: "For teams and enterprises",
    icon: <Crown className="w-6 h-6" />,
    color: "pink",
    features: [
      "500,000 credits/month",
      "All AI tools access",
      "Highest priority processing",
      "4K video generation",
      "Dedicated support",
      "API access",
    ],
  },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (tier: string) => {
    if (status === "unauthenticated") {
      router.push(`/signin?callbackUrl=/pricing`);
      return;
    }

    setLoadingTier(tier);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">Creator Studio</span>
          </Link>
          {session ? (
            <Link href="/account" className="btn-secondary text-sm">
              Account
            </Link>
          ) : (
            <Link href="/signin" className="btn-primary text-sm">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <div className="text-center py-16 px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Simple, transparent pricing
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-[var(--foreground-muted)] max-w-2xl mx-auto"
        >
          Choose the plan that fits your needs. All plans include access to all
          AI tools with monthly credit refreshes.
        </motion.p>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className={`relative glass-card p-6 ${
                plan.popular ? "ring-2 ring-[var(--neon-purple)]" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-[var(--neon-purple)] text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  plan.color === "cyan"
                    ? "bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)]"
                    : plan.color === "purple"
                    ? "bg-[var(--neon-purple)]/20 text-[var(--neon-purple)]"
                    : "bg-[var(--neon-pink)]/20 text-[var(--neon-pink)]"
                }`}
              >
                {plan.icon}
              </div>

              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-[var(--foreground-muted)] mb-4">
                {plan.description}
              </p>

              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-[var(--foreground-muted)]">/month</span>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">
                  {plan.credits} credits/month
                </p>
              </div>

              <motion.button
                onClick={() => handleSubscribe(plan.tier)}
                disabled={loadingTier !== null}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? "bg-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/90"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {loadingTier === plan.tier ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Get Started"
                )}
              </motion.button>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]"
                  >
                    <Check className="w-4 h-4 text-[var(--neon-cyan)]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* FAQ or additional info */}
        <div className="mt-16 text-center">
          <p className="text-[var(--foreground-muted)]">
            Need more credits?{" "}
            <a
              href="mailto:support@creatorstudio.ai"
              className="text-[var(--neon-cyan)] hover:underline"
            >
              Contact us
            </a>{" "}
            for custom enterprise plans.
          </p>
        </div>
      </div>
    </div>
  );
}
