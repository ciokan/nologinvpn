/**
 * Single source of truth for site-wide metadata.
 * Import `siteConfig` anywhere — pages, layouts, JSON-LD, sitemaps.
 */

export const siteConfig = {
  name: "NoLoginVPN",
  tagline: "Private by Design",
  fullName: "NoLoginVPN — Anonymous VPN | No Account, No Logs, No Registration",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://nologinvpn.com",
  description:
    "VPN access with zero registration. No email, no account, no logs — ever. " +
    "Connect anonymously in seconds. Pay with crypto. Built for real privacy.",
  shortDescription:
    "Anonymous WireGuard VPN. No account. No logs. No tracking.",
  keywords: [
    "VPN",
    "WireGuard",
    "anonymous VPN",
    "no-log VPN",
    "privacy VPN",
    "no account VPN",
    "crypto VPN",
    "anonymous internet",
    "privacy",
    "secure tunnel",
    "nologinvpn",
  ],
  locale: "en_US",
  twitterHandle: "@nologinvpn",
  // Dynamic OG image via Next.js ImageResponse (app/opengraph-image.tsx)
  ogImage: "/opengraph-image",
  icons: {
    favicon: "/favicon.ico",
    icon16: "/favicon-16x16.png",
    icon32: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
    manifest: "/site.webmanifest",
  },
  themeColor: "#00d4aa", // primary teal
  authors: [{ name: "NoLoginVPN", url: "https://nologinvpn.com" }],
} as const;

export type SiteConfig = typeof siteConfig;
