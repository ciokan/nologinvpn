import Link from "next/link";
import { Shield, Zap, Globe, Lock, ChevronRight, Check, Eye, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/ui/mode-toggle";

const features = [
  {
    icon: Shield,
    title: "Zero-Knowledge Architecture",
    desc: "No email, no name, no password. Your access key lives only with you.",
  },
  {
    icon: Zap,
    title: "WireGuard & Amnezia VPN",
    desc: "Standard WireGuard for speed, Amnezia WG for obfuscation. Pick the right tool for your threat model.",
  },
  {
    icon: Globe,
    title: "Global Nodes",
    desc: "Servers across 8+ countries. Low-latency routes, no single point of failure.",
  },
  {
    icon: Lock,
    title: "Browser-Side Keys",
    desc: "Your WireGuard / Amnezia private key is generated in-browser. We never see it.",
  },
  {
    icon: Eye,
    title: "No Logs",
    desc: "We don't track connections, timestamps, or bandwidth. Nothing to hand over.",
  },
  {
    icon: RefreshCcw,
    title: "No Auto-Renewal",
    desc: "Pay once, use it. No subscriptions, no recurring charges, no surprise bills. Add more time when you're ready.",
  },
];

const plans = [
  { label: "1 Month", price: "$6.99", perMonth: "$6.99/mo", popular: false },
  { label: "3 Months", price: "$17.99", perMonth: "$6.00/mo", popular: false },
  { label: "6 Months", price: "$29.99", perMonth: "$5.00/mo", popular: true },
  { label: "12 Months", price: "$49.99", perMonth: "$4.17/mo", popular: false },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold tracking-tight">NoLoginVPN</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/access">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Access Dashboard
              </Button>
            </Link>
            <Link href="/access">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                Get Started <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-4">
        {/* glow orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full bg-secondary/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <Badge className="mb-6 border-primary/30 bg-primary/10 text-primary hover:bg-primary/10">
            WireGuard &amp; Amnezia VPN
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Private by{" "}
            <span className="gradient-text">Design</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            No account. No email. No password. Get an anonymous access key,
            pick WireGuard or Amnezia WG, generate your config in the browser,
            and connect in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/access">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base px-8 py-6 pulse-glow"
              >
                Generate Access Key
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#pricing">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-border/60 hover:border-primary/40 text-base px-8 py-6"
              >
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {["No Email Required", "No Logs", "Crypto Accepted", "WireGuard & Amnezia"].map(
              (badge) => (
                <div key={badge} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  {badge}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Privacy-First Users
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every decision in NoLoginVPN was made to minimize what we know
              about you — which is nothing.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group card-glass rounded-xl p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-4 relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 w-[600px] h-60 -translate-x-1/2 bg-primary/3 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Up & Running in 3 Steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Generate Your Key",
                desc: "Click once — we generate a unique access key. Copy it and keep it safe. It's your only credential.",
              },
              {
                step: "02",
                title: "Choose a Plan",
                desc: "Pick from 1, 3, 6, or 12-month plans. Pay with Stripe or crypto. No subscription traps.",
              },
              {
                step: "03",
                title: "Connect",
                desc: "Choose WireGuard or Amnezia WG, generate your keys in the browser, pick a server, and download your config. Done.",
              },
            ].map((item) => (
              <div key={item.step} className="relative card-glass rounded-xl p-6">
                <div className="text-4xl font-black text-primary/20 mb-4 font-mono">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground">
              No auto-renewal by default. Pay what you want, when you want.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.label}
                className={`relative card-glass rounded-xl p-6 flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? "border-primary/40 bg-primary/5"
                    : "hover:border-border/80"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold">
                    Best Value
                  </Badge>
                )}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1">{plan.label}</p>
                  <p className="text-3xl font-bold">{plan.price}</p>
                  <p className="text-xs text-primary mt-1">{plan.perMonth}</p>
                </div>
                <ul className="flex-1 space-y-2 mb-6 text-sm text-muted-foreground">
                  {[
                    "All server locations",
                    "Up to 3 devices",
                    "WireGuard & Amnezia WG",
                    "No logs",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/access">
                  <Button
                    size="sm"
                    className={`w-full font-semibold ${
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Accepts Stripe, Bitcoin, Ethereum, USDT, Monero
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-10 px-4">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">NoLoginVPN</span>
          </div>
          <p>© {new Date().getFullYear()} nologinvpn.com — Privacy is a right.</p>
          <div className="flex gap-4">
            <Link href="/p/privacy-policy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/p/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
