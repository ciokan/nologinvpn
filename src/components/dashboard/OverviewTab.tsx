"use client";

import { Shield, Calendar, Clock, Zap, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Props {
  subscriptionExpiresAt: string | null;
  createdAt: string;
  onPurchase: () => void;
}

function daysRemaining(expiresAt: string | null): number {
  if (!expiresAt) return 0;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function OverviewTab({ subscriptionExpiresAt, createdAt, onPurchase }: Props) {
  const days = daysRemaining(subscriptionExpiresAt);
  const isActive = subscriptionExpiresAt && new Date(subscriptionExpiresAt) > new Date();
  const isExpiringSoon = isActive && days <= 7;

  // Progress: assuming max visible 30 days for display purposes
  const progressPct = Math.min(100, (days / 30) * 100);

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome to your NoLoginVPN dashboard.
        </p>
      </div>

      {/* ── Subscription card ── */}
      <div
        className={`card-glass rounded-xl p-6 ${
          isActive
            ? isExpiringSoon
              ? "border-amber-500/30"
              : "border-primary/20"
            : "border-destructive/20"
        }`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isActive ? (
                <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">
                  <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Active
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  <span className="mr-1.5">●</span>
                  Inactive
                </Badge>
              )}
            </div>
            <h2 className="font-semibold text-lg">VPN Subscription</h2>
          </div>
          {!isActive && (
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
              onClick={onPurchase}
            >
              Activate <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {isActive ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Expires:</span>
              <span className="font-medium">{formatDate(subscriptionExpiresAt!)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Time left:</span>
              <span
                className={`font-semibold ${
                  isExpiringSoon ? "text-amber-400" : "text-primary"
                }`}
              >
                {days} day{days !== 1 ? "s" : ""}
              </span>
            </div>
            <Progress value={progressPct} className="h-1.5 mt-1" />
            {isExpiringSoon && (
              <div className="flex items-center gap-2 text-xs text-amber-400 mt-2">
                <AlertCircle className="h-3.5 w-3.5" />
                Your subscription expires soon. Add more time to avoid interruption.
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 border-border/60 hover:border-primary/40"
              onClick={onPurchase}
            >
              Add More Time
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            You don&apos;t have an active subscription. Purchase a plan to start
            using NoLoginVPN.
          </p>
        )}
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Shield,
            label: "Protocol",
            value: "WG / Amnezia",
            sub: "Modern • Fast • Obfuscated",
          },
          {
            icon: Zap,
            label: "Max Devices",
            value: "3",
            sub: "Simultaneous connections",
          },
          {
            icon: Calendar,
            label: "Member Since",
            value: formatDate(createdAt),
            sub: "Account created",
          },
        ].map((stat) => (
          <div key={stat.label} className="card-glass rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
              <stat.icon className="h-3.5 w-3.5" />
              {stat.label}
            </div>
            <p className="font-semibold text-base">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Quick tips ── */}
      <div className="card-glass rounded-xl p-6">
        <h3 className="font-semibold mb-3 text-sm">Getting Started</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="text-primary font-mono font-bold shrink-0">1.</span>
            Purchase a subscription plan from the{" "}
            <button
              onClick={onPurchase}
              className="text-primary hover:underline"
            >
              Purchase tab
            </button>
            .
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-mono font-bold shrink-0">2.</span>
            Go to <strong className="text-foreground">Devices & Keys</strong>, choose
            WireGuard or Amnezia WG, and generate your keys in the browser.
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-mono font-bold shrink-0">3.</span>
            Select a matching server node and download your configuration file.
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-mono font-bold shrink-0">4.</span>
            Import the config into the WireGuard or Amnezia client app and connect.
          </li>
        </ol>
      </div>
    </div>
  );
}
