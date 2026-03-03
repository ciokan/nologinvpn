export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(plans)
      .where(eq(plans.active, true))
      .orderBy(plans.durationMonths);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[api/plans]", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
