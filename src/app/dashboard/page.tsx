import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

// ─── Dynamic Metadata ─────────────────────────────────────────────────────────
// Shows subscription status in the browser tab title.
export async function generateMetadata(): Promise<Metadata> {
  const session = await getSession();
  if (!session) return { title: "Dashboard" };

  const [user] = await db
    .select({ subscriptionExpiresAt: users.subscriptionExpiresAt })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const exp = user?.subscriptionExpiresAt;
  const isActive = exp && exp > new Date();
  const daysLeft = isActive
    ? Math.max(0, Math.floor((exp.getTime() - Date.now()) / 86_400_000))
    : 0;

  const subtitle = isActive
    ? daysLeft <= 7
      ? `Dashboard — ⚠️ ${daysLeft}d left`
      : `Dashboard — Active`
    : "Dashboard — Inactive";

  return { title: subtitle };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/access");

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      // Session JWT is valid but user row is gone (e.g. DB wipe) —
      // redirect through the logout route handler so it can clear the cookie
      redirect("/api/auth/logout");
    }

    return (
      <DashboardShell
        userId={user.id}
        subscriptionExpiresAt={user.subscriptionExpiresAt?.toISOString() ?? null}
        createdAt={user.createdAt.toISOString()}
      />
    );
  } catch (err) {
    // redirect() throws a NEXT_REDIRECT internally — let it propagate
    if (isRedirectError(err)) throw err;
    console.error("[dashboard] failed to load user:", err);
    throw new Error("Failed to load dashboard. Please try again.");
  }
}
