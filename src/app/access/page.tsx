import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AccessForm } from "./AccessForm";
import { siteConfig } from "@/lib/site";

// ─── Page Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Access Dashboard",
  description:
    "Generate your anonymous access key or sign in with your existing key. " +
    "No email or password required — your key is your only credential.",
  // Login/access pages shouldn't be indexed
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    title: `Access Dashboard | ${siteConfig.name}`,
    description:
      "Generate your anonymous access key or sign in with your existing key.",
    url: `${siteConfig.url}/access`,
  },
  alternates: {
    canonical: `${siteConfig.url}/access`,
  },
};

export default async function AccessPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return <AccessForm />;
}
