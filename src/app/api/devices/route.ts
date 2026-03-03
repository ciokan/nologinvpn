export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { devices, nodes } from "@/lib/db/schema";
import { getSessionFromRequest } from "@/lib/session";

const MAX_DEVICES = 3;

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db
      .select({
        id: devices.id,
        name: devices.name,
        publicKey: devices.publicKey,
        protocol: devices.protocol,
        nodeId: devices.nodeId,
        createdAt: devices.createdAt,
        nodeName: nodes.name,
        nodeLocation: nodes.location,
        nodeEndpoint: nodes.endpoint,
        nodeDns: nodes.dns,
        nodePublicKey: nodes.publicKey,
        nodeProtocol: nodes.protocol,
        nodeAmneziaParams: nodes.amneziaParams,
      })
      .from(devices)
      .leftJoin(nodes, eq(devices.nodeId, nodes.id))
      .where(eq(devices.userId, session.userId))
      .orderBy(devices.createdAt);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[api/devices GET]", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, publicKey, protocol = "wireguard", nodeId } = body;

    if (!name?.trim() || !publicKey?.trim()) {
      return NextResponse.json({ error: "name and publicKey are required" }, { status: 400 });
    }

    const existing = await db
      .select({ id: devices.id })
      .from(devices)
      .where(eq(devices.userId, session.userId));

    if (existing.length >= MAX_DEVICES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_DEVICES} devices allowed` },
        { status: 400 }
      );
    }

    const [device] = await db
      .insert(devices)
      .values({
        userId: session.userId,
        name: name.trim(),
        publicKey: publicKey.trim(),
        protocol: protocol === "amnezia" ? "amnezia" : "wireguard",
        nodeId: nodeId || null,
      })
      .returning();

    return NextResponse.json(device, { status: 201 });
  } catch (err) {
    console.error("[api/devices POST]", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
