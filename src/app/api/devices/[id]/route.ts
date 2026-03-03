import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { devices } from "@/lib/db/schema";
import { getSessionFromRequest } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { name, nodeId } = body;

    const updates: Partial<{ name: string; nodeId: string | null }> = {};
    if (name !== undefined) updates.name = name.trim();
    if (nodeId !== undefined) updates.nodeId = nodeId;

    const [updated] = await db
      .update(devices)
      .set(updates)
      .where(and(eq(devices.id, id), eq(devices.userId, session.userId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[api/devices PATCH]", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const [deleted] = await db
      .delete(devices)
      .where(and(eq(devices.id, id), eq(devices.userId, session.userId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/devices DELETE]", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
