import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { devices, nodes } from "@/lib/db/schema";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const [device] = await db
      .select({
        id: devices.id,
        name: devices.name,
        publicKey: devices.publicKey,
        protocol: devices.protocol,
        nodeId: devices.nodeId,
        nodeName: nodes.name,
        nodePublicKey: nodes.publicKey,
        nodeEndpoint: nodes.endpoint,
        nodeDns: nodes.dns,
        nodeProtocol: nodes.protocol,
        nodeAmneziaParams: nodes.amneziaParams,
      })
      .from(devices)
      .leftJoin(nodes, eq(devices.nodeId, nodes.id))
      .where(and(eq(devices.id, id), eq(devices.userId, session.userId)))
      .limit(1);

    if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });
    if (!device.nodeId) return NextResponse.json({ error: "No node selected for this device" }, { status: 400 });

    return NextResponse.json({
      deviceName: device.name,
      protocol: device.protocol,
      publicKey: device.publicKey,
      serverPublicKey: device.nodePublicKey,
      endpoint: device.nodeEndpoint,
      dns: device.nodeDns,
      amneziaParams: device.nodeAmneziaParams ?? null,
    });
  } catch (err) {
    console.error("[api/devices/config]", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
