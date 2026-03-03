import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { signSession, getSessionCookieOptions } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { key } = await req.json();

    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "Access key is required" }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.hash, key.trim())).limit(1);

    if (!user) {
      return NextResponse.json({ error: "Invalid access key" }, { status: 401 });
    }

    const token = await signSession({ userId: user.id, hash: user.hash });

    const opts = getSessionCookieOptions();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(opts.name, token, {
      maxAge: opts.maxAge,
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      path: opts.path,
    });

    return res;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
