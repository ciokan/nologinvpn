export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { nodes } from "@/lib/db/schema";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select({
        id: nodes.id,
        name: nodes.name,
        location: nodes.location,
        datacenter: nodes.datacenter,
        country: nodes.country,
        endpoint: nodes.endpoint,
        dns: nodes.dns,
        protocol: nodes.protocol,
      })
      .from(nodes)
      .where(eq(nodes.active, true))
      .orderBy(nodes.protocol, nodes.country, nodes.name);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[api/nodes]", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
