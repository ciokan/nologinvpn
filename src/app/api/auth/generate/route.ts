export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { generateAccessKey } from "@/lib/hash";

export async function POST() {
  try {
    const key = generateAccessKey();

    await db.insert(users).values({ hash: key });

    return NextResponse.json({ key }, { status: 201 });
  } catch (err) {
    console.error("[auth/generate]", err);
    return NextResponse.json(
      { error: "Failed to generate access key" },
      { status: 500 }
    );
  }
}
