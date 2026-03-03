import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { transactions, users, plans } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeKey, { apiVersion: "2026-02-25.clover" as const });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as import("stripe").Stripe.Checkout.Session;
    const { transactionId, userId, planId } = checkoutSession.metadata ?? {};

    if (!transactionId || !userId || !planId) {
      console.error("[stripe/webhook] missing metadata");
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    await db
      .update(transactions)
      .set({ status: "confirmed", confirmedAt: new Date() })
      .where(eq(transactions.id, transactionId));

    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    if (plan) {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const base =
        user?.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date()
          ? user.subscriptionExpiresAt
          : new Date();

      const expiry = new Date(base);
      expiry.setMonth(expiry.getMonth() + plan.durationMonths);

      await db
        .update(users)
        .set({ subscriptionExpiresAt: expiry })
        .where(eq(users.id, userId));
    }
  }

  return NextResponse.json({ received: true });
}
