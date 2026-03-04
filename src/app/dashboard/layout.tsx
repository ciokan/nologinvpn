import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/site";

// ─── Layout Metadata (applies to all /dashboard/* routes) ────────────────────
// Private area: never index, never follow, never cache in search engines.
export const metadata: Metadata = {
  title: "Dashboard",
  description: `Manage your ${siteConfig.name} subscription, WireGuard devices, and server nodes.`,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  // Suppress OG/Twitter sharing for the dashboard
  openGraph: {
    title: `Dashboard | ${siteConfig.name}`,
    description: `Your private ${siteConfig.name} dashboard.`,
    url: `${siteConfig.url}/dashboard`,
  },
  // No canonical for private pages
  alternates: {},
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/access");

  return <>{children}</>;
}
