"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Bitcoin,
  Check,
  Loader2,
  Copy,
  QrCode,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  label: string;
  durationMonths: number;
  priceUsd: string;
}

interface CryptoPaymentData {
  wallet: string;
  currency: string;
  amountUsd: string;
  transactionId: string;
  memo: string;
}

interface Props {
  subscriptionExpiresAt: string | null;
  onSuccess: (newExpiry: string) => void;
}

const CRYPTO_OPTIONS = [
  { id: "btc", label: "Bitcoin", symbol: "BTC" },
  { id: "eth", label: "Ethereum", symbol: "ETH" },
  { id: "usdt", label: "Tether", symbol: "USDT" },
  { id: "xmr", label: "Monero", symbol: "XMR", private: true },
];

export function PurchaseTab({ subscriptionExpiresAt, onSuccess: _onSuccess }: Props) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [cryptoData, setCryptoData] = useState<CryptoPaymentData | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState("btc");
  const [copied, setCopied] = useState(false);

  const isActive =
    subscriptionExpiresAt && new Date(subscriptionExpiresAt) > new Date();

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        setPlans(data);
        if (data.length > 0) {
          // default to the "best value" — 6 months
          const best = data.find((p: Plan) => p.durationMonths === 6) || data[0];
          setSelectedPlan(best);
        }
        setLoading(false);
      });
  }, []);

  // ── Stripe checkout ───────────────────────────────────────────────────────

  const handleStripe = async () => {
    if (!selectedPlan) return;
    setPayLoading(true);
    try {
      const res = await fetch("/api/payment/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Stripe error");
      window.location.href = data.url;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPayLoading(false);
    }
  };

  // ── Crypto checkout ───────────────────────────────────────────────────────

  const handleCrypto = async () => {
    if (!selectedPlan) return;
    setPayLoading(true);
    try {
      const res = await fetch("/api/payment/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          currency: selectedCrypto,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error creating payment");
      setCryptoData(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setPayLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  function perMonth(plan: Plan): string {
    return (Number(plan.priceUsd) / plan.durationMonths).toFixed(2);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">
          {isActive ? "Add More Time" : "Purchase VPN Access"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isActive
            ? "Extend your subscription. Time is added on top of your current expiry."
            : "Choose a plan and complete payment to activate your VPN."}
        </p>
      </div>

      {/* ── Plan selector ── */}
      <div>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          Select Plan
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {plans.map((plan) => {
            const isBest = plan.durationMonths === 6;
            const isSelected = selectedPlan?.id === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`relative card-glass rounded-xl p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
                    : "hover:border-border/80"
                }`}
              >
                {isBest && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-primary text-primary-foreground font-semibold">
                    Best
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground mb-1">
                  {plan.label}
                </p>
                <p className="text-xl font-bold">${plan.priceUsd}</p>
                <p className="text-xs text-primary mt-1">
                  ${perMonth(plan)}/mo
                </p>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* ── Payment methods ── */}
      {selectedPlan && (
        <div>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
            Payment Method
          </h2>

          <Tabs defaultValue="stripe" className="w-full">
            <TabsList className="bg-muted/40 border border-border/40 mb-5">
              <TabsTrigger value="stripe" className="flex-1 text-sm">
                <CreditCard className="h-4 w-4 mr-2" />
                Card (Stripe)
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex-1 text-sm">
                <Bitcoin className="h-4 w-4 mr-2" />
                Crypto
              </TabsTrigger>
            </TabsList>

            {/* ── Stripe tab ── */}
            <TabsContent value="stripe">
              <div className="card-glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">{selectedPlan.label}</p>
                    <p className="text-sm text-muted-foreground">
                      Pay with credit/debit card via Stripe
                    </p>
                  </div>
                  <p className="text-2xl font-bold">${selectedPlan.priceUsd}</p>
                </div>
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  onClick={handleStripe}
                  disabled={payLoading}
                >
                  {payLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  Pay with Stripe — ${selectedPlan.priceUsd}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Secured by Stripe. Accepts Visa, Mastercard, Amex.
                </p>
              </div>
            </TabsContent>

            {/* ── Crypto tab ── */}
            <TabsContent value="crypto">
              <div className="card-glass rounded-xl p-6 space-y-5">
                {/* Currency selector */}
                <div>
                  <p className="text-sm font-medium mb-3">Select cryptocurrency</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CRYPTO_OPTIONS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCrypto(c.id);
                          setCryptoData(null);
                        }}
                        className={`rounded-lg px-3 py-2 text-xs font-medium border transition-all ${
                          selectedCrypto === c.id
                            ? "bg-primary/10 border-primary/40 text-primary"
                            : "border-border/60 text-muted-foreground hover:border-border"
                        }`}
                      >
                        {c.symbol}
                        {c.private && (
                          <span className="ml-1 text-purple-400">★</span>
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedCrypto === "xmr" && (
                    <p className="text-xs text-purple-400 mt-1.5">
                      ★ Monero provides enhanced privacy for payments.
                    </p>
                  )}
                </div>

                {!cryptoData ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{selectedPlan.label}</p>
                        <p className="text-sm text-muted-foreground">
                          Pay with{" "}
                          {CRYPTO_OPTIONS.find((c) => c.id === selectedCrypto)?.label}
                        </p>
                      </div>
                      <p className="text-2xl font-bold">${selectedPlan.priceUsd}</p>
                    </div>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                      onClick={handleCrypto}
                      disabled={payLoading}
                    >
                      {payLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <QrCode className="h-4 w-4 mr-2" />
                      )}
                      Generate Payment Address
                    </Button>
                  </>
                ) : (
                  /* ── Crypto payment details ── */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        Send exactly{" "}
                        <span className="text-primary">
                          ${cryptoData.amountUsd} USD
                        </span>{" "}
                        worth of {cryptoData.currency}
                      </p>
                      <button
                        onClick={() => setCryptoData(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-xl">
                        <QRCodeSVG
                          value={`${cryptoData.currency.toLowerCase()}:${cryptoData.wallet}`}
                          size={180}
                          level="M"
                        />
                      </div>
                    </div>

                    {/* Wallet address */}
                    <div className="bg-muted/40 rounded-lg p-3 border border-border/60">
                      <p className="text-xs text-muted-foreground mb-1">
                        {cryptoData.currency} Wallet Address
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs break-all flex-1">
                          {cryptoData.wallet}
                        </p>
                        <button
                          onClick={() => handleCopy(cryptoData.wallet)}
                          className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Memo/reference */}
                    <div className="bg-muted/40 rounded-lg p-3 border border-border/60">
                      <p className="text-xs text-muted-foreground mb-1">
                        Payment Reference (include in memo if possible)
                      </p>
                      <p className="font-mono text-sm font-semibold text-primary">
                        {cryptoData.memo}
                      </p>
                    </div>

                    {/* Single-use warning — prominent */}
                    <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        This address is for ONE payment only
                      </div>
                      <ul className="text-xs text-amber-200/80 space-y-1.5 ml-6 list-disc">
                        <li>
                          Send <strong className="text-amber-300">exactly once</strong> — this wallet was generated for this transaction only.
                        </li>
                        <li>
                          <strong className="text-amber-300">Do not reuse it</strong> for future purchases — generate a new address each time.
                        </li>
                        <li>
                          After confirmation (typically 1–6 blocks), your subscription is activated manually. Allow up to 24h.
                        </li>
                        <li>
                          If something goes wrong, contact support with your payment reference: <span className="font-mono text-amber-300">{cryptoData.transactionId}</span>
                        </li>
                      </ul>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      Transaction ID: {cryptoData.transactionId}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* ── Info ── */}
      <div className="card-glass rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">What you get</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
          {[
            "Access to all server locations",
            "Up to 3 simultaneous devices",
            "WireGuard & Amnezia VPN",
            "No logs, no tracking",
            "Can add more time at any time",
            "Config generated in browser",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
