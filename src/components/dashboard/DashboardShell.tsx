"use client";

import { useState } from "react";
import { Shield, Cpu, CreditCard, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { toast } from "sonner";
import { OverviewTab } from "./OverviewTab";
import { DevicesTab } from "./DevicesTab";
import { PurchaseTab } from "./PurchaseTab";

type Tab = "overview" | "devices" | "purchase";

interface Props {
  userId: string;
  subscriptionExpiresAt: string | null;
  createdAt: string;
}

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Shield },
  { id: "devices", label: "Devices & Keys", icon: Cpu },
  { id: "purchase", label: "Purchase", icon: CreditCard },
];

interface NavContentProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onLogout: () => void;
}

function NavContent({ activeTab, onTabChange, onLogout }: NavContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border/40">
        <Shield className="h-5 w-5 text-primary" />
        <Link href="/" className="font-semibold tracking-tight hover:text-primary transition-colors flex-1">
          NoLoginVPN
        </Link>
        <ModeToggle />
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === item.id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>

      <Separator className="mx-3 w-auto" />

      {/* Logout */}
      <div className="p-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function DashboardShell({ userId: _userId, subscriptionExpiresAt, createdAt }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/");
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Sidebar (desktop) ─── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border/40 bg-card/50">
        <NavContent activeTab={tab} onTabChange={handleTabChange} onLogout={handleLogout} />
      </aside>

      {/* ── Mobile overlay ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-card border-r border-border/40">
            <NavContent activeTab={tab} onTabChange={handleTabChange} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* ── Main ─── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border/40">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Shield className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">NoLoginVPN</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono capitalize">{tab}</span>
            <ModeToggle />
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 p-4 md:p-8 max-w-5xl">
          {tab === "overview" && (
            <OverviewTab
              subscriptionExpiresAt={subscriptionExpiresAt}
              createdAt={createdAt}
              onPurchase={() => handleTabChange("purchase")}
            />
          )}
          {tab === "devices" && (
            <DevicesTab />
          )}
          {tab === "purchase" && (
            <PurchaseTab
              subscriptionExpiresAt={subscriptionExpiresAt}
              onSuccess={() => {
                // parent can't re-render server data directly, page refresh handles it
                router.refresh();
                handleTabChange("overview");
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
