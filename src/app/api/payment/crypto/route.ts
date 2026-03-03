export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans, transactions } from "@/lib/db/schema";
import { getSessionFromRequest } from "@/lib/session";

const WALLETS: Record<string, string | undefined> = {
  btc: process.env.CRYPTO_BTC_WALLET,
  eth: process.env.CRYPTO_ETH_WALLET,
  usdt: process.env.CRYPTO_USDT_WALLET,
  xmr: process.env.CRYPTO_XMR_WALLET,
};

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { planId, currency } = await req.json();

    if (!planId || !currency) {
      return NextResponse.json({ error: "planId and currency required" }, { status: 400 });
    }

    const coin = currency.toLowerCase();
    if (!WALLETS[coin]) {
      return NextResponse.json({ error: "Unsupported currency" }, { status: 400 });
    }

    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const wallet = WALLETS[coin]!;

    const [txn] = await db
      .insert(transactions)
      .values({
        userId: session.userId,
        planId: plan.id,
        amountUsd: plan.priceUsd,
        paymentMethod: coin as "btc" | "eth" | "usdt" | "xmr",
        status: "pending",
      })
      .returning();

    return NextResponse.json({
      wallet,
      currency: coin.toUpperCase(),
      amountUsd: plan.priceUsd,
      transactionId: txn.id,
      memo: `NLVPN-${txn.id.slice(0, 8).toUpperCase()}`,
    });
  } catch (err) {
    console.error("[api/payment/crypto]", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
