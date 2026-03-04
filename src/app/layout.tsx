import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/lib/site";

// ─── Viewport (separate export — Next.js 14+) ─────────────────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColor },
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColor },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

// ─── Root Metadata (inherited by all pages unless overridden) ─────────────────
export const metadata: Metadata = {
  // title.template applies to all child pages:
  //   page exports `title: "Foo"` → renders "Foo | NoLoginVPN"
  //   root layout itself uses `default` for the home page fallback
  title: {
    template: `%s | ${siteConfig.name}`,
    default: siteConfig.fullName,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [...siteConfig.authors],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  metadataBase: new URL(siteConfig.url),

  // ── Robots (default: allow indexing) ──────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Icons ─────────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: siteConfig.icons.icon16, sizes: "16x16", type: "image/png" },
      { url: siteConfig.icons.icon32, sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: siteConfig.icons.apple, sizes: "180x180" }],
    shortcut: siteConfig.icons.favicon,
  },
  manifest: siteConfig.icons.manifest,

  // ── Open Graph ────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.fullName,
    description: siteConfig.shortDescription,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.tagline}`,
      },
    ],
  },

  // ── Twitter / X ───────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title: siteConfig.fullName,
    description: siteConfig.shortDescription,
    images: [siteConfig.ogImage],
  },

  // ── Apple PWA ─────────────────────────────────────────────────────────────
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },

  // ── Misc ──────────────────────────────────────────────────────────────────
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}
