import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

// Subscription tier configuration
export const SUBSCRIPTION_TIERS = {
  free: {
    name: "free",
    displayName: "Free",
    price: 0,
    credits: 1000, // Small amount for trial
    features: [
      "1,000 credits",
      "Basic AI chat",
      "Limited image generation",
      "Community support",
    ],
  },
  starter: {
    name: "starter",
    displayName: "Starter",
    price: 2900, // $29.00 in cents
    credits: 25000,
    stripePriceId: process.env.STRIPE_PRICE_STARTER || "",
    features: [
      "25,000 credits/month",
      "All AI tools access",
      "Image & video generation",
      "Speech synthesis",
      "Email support",
    ],
  },
  pro: {
    name: "pro",
    displayName: "Pro",
    price: 7900, // $79.00 in cents
    credits: 100000,
    stripePriceId: process.env.STRIPE_PRICE_PRO || "",
    features: [
      "100,000 credits/month",
      "All AI tools access",
      "Priority processing",
      "HD video generation",
      "Priority support",
    ],
  },
  business: {
    name: "business",
    displayName: "Business",
    price: 19900, // $199.00 in cents
    credits: 500000,
    stripePriceId: process.env.STRIPE_PRICE_BUSINESS || "",
    features: [
      "500,000 credits/month",
      "All AI tools access",
      "Highest priority processing",
      "4K video generation",
      "Dedicated support",
      "API access",
    ],
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export function getCreditsForTier(tier: string): number {
  const config = SUBSCRIPTION_TIERS[tier as SubscriptionTier];
  return config?.credits || 0;
}

export function getTierByPriceId(priceId: string): SubscriptionTier | null {
  for (const [tierName, config] of Object.entries(SUBSCRIPTION_TIERS)) {
    if ("stripePriceId" in config && config.stripePriceId === priceId) {
      return tierName as SubscriptionTier;
    }
  }
  return null;
}
