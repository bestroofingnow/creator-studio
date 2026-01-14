import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch all stats in parallel
    const [
      totalUsers,
      newUsersToday,
      newUsersThisMonth,
      activeSubscriptions,
      subscriptionsByTier,
      totalCreditsUsed,
      creditsUsedToday,
      creditsUsedThisMonth,
      toolUsageStats,
      recentTransactions,
      userGrowthData,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // New users today
      prisma.user.count({
        where: { createdAt: { gte: today } },
      }),

      // New users this month
      prisma.user.count({
        where: { createdAt: { gte: thisMonth } },
      }),

      // Active subscriptions (non-free)
      prisma.user.count({
        where: {
          subscriptionStatus: "active",
          subscriptionTier: { not: "free" },
        },
      }),

      // Subscriptions by tier
      prisma.user.groupBy({
        by: ["subscriptionTier"],
        _count: { id: true },
      }),

      // Total credits used (from transactions)
      prisma.creditTransaction.aggregate({
        where: { type: "usage" },
        _sum: { amount: true },
      }),

      // Credits used today
      prisma.creditTransaction.aggregate({
        where: {
          type: "usage",
          createdAt: { gte: today },
        },
        _sum: { amount: true },
      }),

      // Credits used this month
      prisma.creditTransaction.aggregate({
        where: {
          type: "usage",
          createdAt: { gte: thisMonth },
        },
        _sum: { amount: true },
      }),

      // Tool usage stats (last 30 days)
      prisma.creditTransaction.groupBy({
        by: ["tool"],
        where: {
          type: "usage",
          createdAt: { gte: last30Days },
          tool: { not: null },
        },
        _count: { id: true },
        _sum: { amount: true },
      }),

      // Recent transactions
      prisma.creditTransaction.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),

      // User growth data (last 30 days, grouped by day)
      prisma.$queryRaw`
        SELECT
          DATE("createdAt") as date,
          COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= ${last30Days}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      ` as Promise<{ date: Date; count: bigint }[]>,
    ]);

    // Format subscription tiers
    const tierCounts: Record<string, number> = {};
    subscriptionsByTier.forEach((tier) => {
      tierCounts[tier.subscriptionTier || "free"] = tier._count.id;
    });

    // Format tool usage
    const toolStats = toolUsageStats.map((stat) => ({
      tool: stat.tool || "unknown",
      count: stat._count.id,
      creditsUsed: Math.abs(stat._sum.amount || 0),
    }));

    // Format user growth
    const growth = userGrowthData.map((day) => ({
      date: day.date,
      count: Number(day.count),
    }));

    return NextResponse.json({
      overview: {
        totalUsers,
        newUsersToday,
        newUsersThisMonth,
        activeSubscriptions,
      },
      subscriptions: {
        byTier: tierCounts,
      },
      credits: {
        totalUsed: Math.abs(totalCreditsUsed._sum.amount || 0),
        usedToday: Math.abs(creditsUsedToday._sum.amount || 0),
        usedThisMonth: Math.abs(creditsUsedThisMonth._sum.amount || 0),
      },
      toolUsage: toolStats.sort((a, b) => b.count - a.count),
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        tool: tx.tool,
        description: tx.description,
        createdAt: tx.createdAt,
        user: tx.user,
      })),
      userGrowth: growth,
    });
  } catch (error) {
    console.error("Admin stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
