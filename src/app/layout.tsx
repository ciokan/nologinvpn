import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "NoLoginVPN — Private by Design",
  description:
    "Anonymous WireGuard & Amnezia VPN access. No account. No logs. No tracking. Pay once, connect instantly.",
  keywords: ["VPN", "WireGuard", "Amnezia", "AmneziaWG", "privacy", "anonymous", "no-log", "obfuscation"],
  openGraph: {
    title: "NoLoginVPN — Private by Design",
    description:
      "Anonymous WireGuard & Amnezia VPN. No account. No logs. No tracking.",
    siteName: "NoLoginVPN",
  },
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
