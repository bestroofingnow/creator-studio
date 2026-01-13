import { NextRequest, NextResponse } from "next/server";
import { stripe, getCreditsForTier, getTierByPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { addCredits } from "@/lib/credits";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;

  if (!userId || !tier) {
    console.error("Missing userId or tier in checkout session metadata");
    return;
  }

  const credits = getCreditsForTier(tier);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: "active",
      stripeSubscriptionId: session.subscription as string,
      credits: credits,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // Log the credit addition
  await addCredits(
    userId,
    credits,
    "subscription_credit",
    `Initial ${tier} subscription credits`
  );

  console.log(`User ${userId} subscribed to ${tier} plan with ${credits} credits`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    // Try to find user by customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    });
    if (!user) return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const tier = getTierByPriceId(priceId);

  if (!tier) return;

  const status = subscription.status === "active" ? "active" :
                 subscription.status === "past_due" ? "past_due" :
                 subscription.status === "canceled" ? "canceled" : "inactive";

  // Get current_period_end safely
  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;

  await prisma.user.update({
    where: { stripeCustomerId: subscription.customer as string },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: status,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.user.update({
    where: { stripeCustomerId: subscription.customer as string },
    data: {
      subscriptionTier: "free",
      subscriptionStatus: "canceled",
      stripeSubscriptionId: null,
      credits: 1000, // Reset to free tier credits
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // This is called for recurring payments (monthly billing)
  const subscriptionId = (invoice as unknown as { subscription?: string | null }).subscription;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Get current_period_end safely
  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
  const periodEndDate = periodEnd ? new Date(periodEnd * 1000) : null;

  const userId = subscription.metadata?.userId;
  if (!userId) {
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: invoice.customer as string },
    });
    if (!user) return;

    const priceId = subscription.items.data[0]?.price.id;
    const tier = getTierByPriceId(priceId);
    if (!tier) return;

    const credits = getCreditsForTier(tier);

    // Refresh monthly credits
    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: credits,
        currentPeriodEnd: periodEndDate,
      },
    });

    await addCredits(
      user.id,
      credits,
      "subscription_credit",
      `Monthly ${tier} subscription credits refreshed`
    );

    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const tier = getTierByPriceId(priceId);
  if (!tier) return;

  const credits = getCreditsForTier(tier);

  await prisma.user.update({
    where: { id: userId },
    data: {
      credits: credits,
      currentPeriodEnd: periodEndDate,
    },
  });

  await addCredits(
    userId,
    credits,
    "subscription_credit",
    `Monthly ${tier} subscription credits refreshed`
  );
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: invoice.customer as string },
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: "past_due",
      },
    });
  }
}
