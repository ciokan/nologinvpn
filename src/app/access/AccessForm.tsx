"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Key,
  Copy,
  Check,
  AlertTriangle,
  LogIn,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ModeToggle } from "@/components/ui/mode-toggle";

type Step = "choose" | "generated" | "login";

export function AccessForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");
  const [generatedKey, setGeneratedKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [loginKey, setLoginKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // ── Generate new key ──────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/generate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate key");
      setGeneratedKey(data.key);
      setStep("generated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate key");
    } finally {
      setLoading(false);
    }
  };

  // ── Copy key ──────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    toast.success("Key copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  // ── Proceed after confirming backup ──────────────────────────────────────
  const handleProceed = async () => {
    if (!confirmed) {
      toast.error("Please confirm you've saved your key before proceeding.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: generatedKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to authenticate");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Login with existing key ───────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginKey.trim()) {
      toast.error("Please enter your access key");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: loginKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid access key");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid access key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold tracking-tight">NoLoginVPN</span>
          </Link>
          <ModeToggle />
        </div>
      </nav>

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">

          {/* ── Step: Choose ─────────────────────────────────────────────── */}
          {step === "choose" && (
            <div className="fade-in">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Access Your Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                  NoLoginVPN uses a single access key instead of passwords.
                </p>
              </div>

              <div className="space-y-4">
                <div className="card-glass rounded-xl p-6">
                  <h2 className="font-semibold mb-1">New here?</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate a unique access key in one click. This is your only
                    credential — store it safely.
                  </p>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Key className="h-4 w-4 mr-2" />
                    )}
                    Generate My Access Key
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs text-muted-foreground">
                    <span className="bg-background px-3">or</span>
                  </div>
                </div>

                <div className="card-glass rounded-xl p-6">
                  <h2 className="font-semibold mb-1">Already have a key?</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your existing access key to continue.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-border/60 hover:border-primary/40"
                    onClick={() => setStep("login")}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Enter Access Key
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step: Generated ──────────────────────────────────────────── */}
          {step === "generated" && (
            <div className="fade-in">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Your Access Key</h1>
                <p className="text-muted-foreground text-sm">
                  This is your only credential. We do not store it in a
                  recoverable form.
                </p>
              </div>

              <div className="card-glass rounded-xl p-6 mb-4">
                {/* Key display */}
                <div className="bg-muted/50 rounded-lg p-4 mb-4 font-mono text-sm break-all text-primary border border-primary/20 select-all">
                  {generatedKey}
                </div>
                <Button
                  className="w-full mb-3 font-semibold"
                  onClick={handleCopy}
                  variant={copied ? "outline" : "default"}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-primary" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Access Key
                    </>
                  )}
                </Button>

                {/* Warning */}
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-4 mb-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-200/80 leading-relaxed">
                      <strong className="text-amber-400">
                        Back this up now.
                      </strong>{" "}
                      Save it in a password manager, write it down, or store
                      it in a secure note. If you lose this key, you lose
                      access to your account permanently. There is no recovery.
                    </div>
                  </div>
                </div>

                {/* Confirmation checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group mb-5">
                  <div
                    className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      confirmed
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/40 group-hover:border-primary/50"
                    }`}
                    onClick={() => setConfirmed((c) => !c)}
                  >
                    {confirmed && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    I have saved my access key in a safe place and understand I
                    cannot recover it if lost.
                  </span>
                </label>

                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  onClick={handleProceed}
                  disabled={loading || !confirmed}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Continue to Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* ── Step: Login ──────────────────────────────────────────────── */}
          {step === "login" && (
            <div className="fade-in">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <LogIn className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Enter Access Key</h1>
                <p className="text-muted-foreground text-sm">
                  Paste the access key you saved when you first signed up.
                </p>
              </div>

              <div className="card-glass rounded-xl p-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Input
                      value={loginKey}
                      onChange={(e) => setLoginKey(e.target.value)}
                      placeholder="xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx"
                      className="font-mono text-sm bg-input border-border/60 focus:border-primary/60"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <LogIn className="h-4 w-4 mr-2" />
                    )}
                    Access Dashboard
                  </Button>
                </form>

                <Button
                  variant="ghost"
                  className="w-full mt-3 text-muted-foreground"
                  onClick={() => setStep("choose")}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
