import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans, transactions } from "@/lib/db/schema";
import { getSessionFromRequest } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { planId } = await req.json();
    if (!planId) return NextResponse.json({ error: "planId required" }, { status: 400 });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "Payment method unavailable." }, { status: 503 });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2026-02-25.clover" as const });

    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

    const [txn] = await db
      .insert(transactions)
      .values({
        userId: session.userId,
        planId: plan.id,
        amountUsd: plan.priceUsd,
        paymentMethod: "stripe",
        status: "pending",
      })
      .returning();

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `NoLoginVPN — ${plan.label}`,
              description: `WireGuard & Amnezia VPN access for ${plan.durationMonths} month(s)`,
            },
            unit_amount: Math.round(Number(plan.priceUsd) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/dashboard?payment=success&txn=${txn.id}`,
      cancel_url: `${appUrl}/dashboard?payment=cancelled`,
      metadata: {
        transactionId: txn.id,
        userId: session.userId,
        planId: plan.id,
      },
    });

    await db
      .update(transactions)
      .set({ paymentId: checkoutSession.id })
      .where(eq(transactions.id, txn.id));

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[api/payment/stripe]", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
