import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export interface CreditCheckResult {
  hasEnoughCredits: boolean;
  currentCredits: number;
  required: number;
}

export async function checkCredits(
  userId: string,
  required: number
): Promise<CreditCheckResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  const currentCredits = user?.credits || 0;

  return {
    hasEnoughCredits: currentCredits >= required,
    currentCredits,
    required,
  };
}

export async function deductCredits(
  userId: string,
  amount: number,
  tool: string,
  description?: string,
  metadata?: Prisma.InputJsonValue
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get current user credits
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.credits < amount) {
        throw new Error("Insufficient credits");
      }

      const newBalance = user.credits - amount;

      // Update user credits
      await tx.user.update({
        where: { id: userId },
        data: { credits: newBalance },
      });

      // Log the transaction
      await tx.creditTransaction.create({
        data: {
          userId,
          amount: -amount, // Negative for deduction
          balance: newBalance,
          type: "deduction",
          tool,
          description: description || `Used ${tool}`,
          metadata: metadata ?? Prisma.JsonNull,
        },
      });

      return newBalance;
    });

    return { success: true, newBalance: result };
  } catch (error) {
    return {
      success: false,
      newBalance: 0,
      error: error instanceof Error ? error.message : "Failed to deduct credits",
    };
  }
}

export async function addCredits(
  userId: string,
  amount: number,
  type: "subscription_credit" | "bonus" | "refund" | "purchase",
  description?: string,
  metadata?: Prisma.InputJsonValue
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const newBalance = user.credits + amount;

      await tx.user.update({
        where: { id: userId },
        data: { credits: newBalance },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          amount, // Positive for addition
          balance: newBalance,
          type,
          description: description || `Added ${amount} credits`,
          metadata: metadata ?? Prisma.JsonNull,
        },
      });

      return newBalance;
    });

    return { success: true, newBalance: result };
  } catch (error) {
    return {
      success: false,
      newBalance: 0,
      error: error instanceof Error ? error.message : "Failed to add credits",
    };
  }
}

export async function refreshSubscriptionCredits(
  userId: string,
  tier: string,
  credits: number
): Promise<{ success: boolean; newBalance: number }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Set credits to the subscription amount (not add)
      await tx.user.update({
        where: { id: userId },
        data: { credits },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          amount: credits,
          balance: credits,
          type: "subscription_credit",
          description: `Monthly ${tier} subscription credits refreshed`,
        },
      });

      return credits;
    });

    return { success: true, newBalance: result };
  } catch {
    return { success: false, newBalance: 0 };
  }
}

// Credit costs for each tool
export const CREDIT_COSTS = {
  chat: 30, // Per message
  "image-generate": 600,
  "image-edit": 600,
  "image-analyze": 100,
  "video-generate-4s": 3000,
  "video-generate-8s": 6000,
  "video-generate-16s": 12000,
  "video-analyze": 500,
  "audio-transcribe": 300, // Per minute
  "speech-generate": 120, // Per 1K characters
  "web-search": 150,
} as const;

export function getToolCost(tool: keyof typeof CREDIT_COSTS): number {
  return CREDIT_COSTS[tool] || 0;
}
