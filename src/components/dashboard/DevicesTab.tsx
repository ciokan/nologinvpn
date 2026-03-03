"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Cpu,
  Plus,
  Trash2,
  Key,
  Download,
  Globe,
  Copy,
  Check,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type Protocol = "wireguard" | "amnezia";

interface AmneziaParams {
  jc: number; jmin: number; jmax: number;
  s1: number; s2: number;
  h1: number; h2: number; h3: number; h4: number;
}

interface Node {
  id: string;
  name: string;
  location: string;
  datacenter: string;
  country: string;
  endpoint: string;
  dns: string;
  protocol: Protocol;
}

interface Device {
  id: string;
  name: string;
  publicKey: string;
  protocol: Protocol;
  nodeId: string | null;
  createdAt: string;
  nodeName: string | null;
  nodeLocation: string | null;
  nodeEndpoint: string | null;
  nodeDns: string | null;
  nodePublicKey: string | null;
  nodeAmneziaParams: AmneziaParams | null;
}

interface WgKeyPair {
  privateKey: string;
  publicKey: string;
}

// ─── Country flags (emoji) ────────────────────────────────────────────────────

function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

// ─── WireGuard key generation (client-side, WebCrypto X25519) ────────────────
// Uses native browser SubtleCrypto — no external deps, properly clamped keys.

// Convert base64url → standard base64 (WebCrypto JWK uses base64url without padding)
function b64urlToB64(b64url: string): string {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  return b64 + "=".repeat((4 - (b64.length % 4)) % 4);
}

async function generateWgKeyPair(): Promise<WgKeyPair> {
  // WebCrypto X25519: private key cannot be exported as "raw" — use JWK.
  // The JWK for an OKP key has:
  //   d = base64url(private scalar, 32 bytes)
  //   x = base64url(public point,  32 bytes)
  const keyPair = (await crypto.subtle.generateKey(
    { name: "X25519" },
    true, // extractable
    ["deriveKey", "deriveBits"]
  )) as CryptoKeyPair;

  const jwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  return {
    privateKey: b64urlToB64(jwk.d!),
    publicKey:  b64urlToB64(jwk.x!),
  };
}

// Build WireGuard or Amnezia WG config
function buildVpnConfig(
  privateKey: string,
  serverPubKey: string,
  endpoint: string,
  dns: string,
  deviceName: string,
  protocol: Protocol,
  amneziaParams?: AmneziaParams | null
): string {
  const clientIp = `10.0.0.${Math.floor(Math.random() * 250) + 2}`;
  const header = protocol === "amnezia"
    ? `# NoLoginVPN — ${deviceName} (Amnezia WG)\n# Generated: ${new Date().toISOString()}`
    : `# NoLoginVPN — ${deviceName} (WireGuard)\n# Generated: ${new Date().toISOString()}`;

  const ifaceSection = protocol === "amnezia" && amneziaParams
    ? `[Interface]
PrivateKey = ${privateKey}
Address = ${clientIp}/32
DNS = ${dns}
Jc = ${amneziaParams.jc}
Jmin = ${amneziaParams.jmin}
Jmax = ${amneziaParams.jmax}
S1 = ${amneziaParams.s1}
S2 = ${amneziaParams.s2}
H1 = ${amneziaParams.h1}
H2 = ${amneziaParams.h2}
H3 = ${amneziaParams.h3}
H4 = ${amneziaParams.h4}`
    : `[Interface]
PrivateKey = ${privateKey}
Address = ${clientIp}/32
DNS = ${dns}`;

  return `${header}

${ifaceSection}

[Peer]
PublicKey = ${serverPubKey}
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = ${endpoint}
PersistentKeepalive = 25
`;
}

// ─── Component ───────────────────────────────────────────────────────────────

const MAX_DEVICES = 3;

export function DevicesTab() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // New device form state
  const [newName, setNewName] = useState("");
  const [newProtocol, setNewProtocol] = useState<Protocol>("wireguard");
  const [keyMode, setKeyMode] = useState<"generate" | "paste">("generate");
  const [wgKeys, setWgKeys] = useState<WgKeyPair | null>(null);
  const [pastedPublicKey, setPastedPublicKey] = useState("");
  const [generatingKeys, setGeneratingKeys] = useState(false);
  const [showPrivKey, setShowPrivKey] = useState(false);
  const [copiedPriv, setCopiedPriv] = useState(false);
  const [copiedPub, setCopiedPub] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [devRes, nodeRes] = await Promise.all([
      fetch("/api/devices"),
      fetch("/api/nodes"),
    ]);
    setDevices(await devRes.json());
    setNodes(await nodeRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Generate WG keys ──────────────────────────────────────────────────────

  const handleGenerateKeys = async () => {
    setGeneratingKeys(true);
    try {
      const pair = await generateWgKeyPair();
      setWgKeys(pair);
    } catch {
      toast.error("Failed to generate keys");
    } finally {
      setGeneratingKeys(false);
    }
  };

  // ── Add device ────────────────────────────────────────────────────────────

  const handleAddDevice = async () => {
    if (!newName.trim()) return toast.error("Device name is required");
    const publicKey = keyMode === "paste" ? pastedPublicKey.trim() : wgKeys?.publicKey;
    if (!publicKey) return toast.error(keyMode === "paste" ? "Paste your public key first" : "Generate WireGuard keys first");
    setSaving(true);
    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, publicKey, protocol: newProtocol }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add device");
      toast.success("Device added");
      setAddOpen(false);
      resetForm();
      fetchAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNewName("");
    setNewProtocol("wireguard");
    setKeyMode("generate");
    setWgKeys(null);
    setPastedPublicKey("");
    setShowPrivKey(false);
    setCopiedPriv(false);
    setCopiedPub(false);
  };

  // ── Delete device ─────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this device?")) return;
    const res = await fetch(`/api/devices/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Device removed");
      fetchAll();
    } else {
      toast.error("Failed to delete");
    }
  };

  // ── Change node ────────────────────────────────────────────────────────────

  const handleNodeChange = async (deviceId: string, nodeId: string) => {
    const res = await fetch(`/api/devices/${deviceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId: nodeId === "none" ? null : nodeId }),
    });
    if (res.ok) {
      toast.success("Server updated");
      fetchAll();
    } else {
      toast.error("Failed to update server");
    }
  };

  // ── Download config ───────────────────────────────────────────────────────

  const handleDownloadConfig = async (device: Device) => {
    if (!device.nodeId || !device.nodePublicKey) {
      toast.error("Select a server node first");
      return;
    }
    const label = device.protocol === "amnezia" ? "Amnezia WG" : "WireGuard";
    const privKey = prompt(
      `Paste your ${label} private key for "${device.name}" to generate the config:`
    );
    if (!privKey) return;

    const conf = buildVpnConfig(
      privKey,
      device.nodePublicKey,
      device.nodeEndpoint!,
      device.nodeDns!,
      device.name,
      device.protocol,
      device.nodeAmneziaParams
    );

    const blob = new Blob([conf], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${device.name.replace(/\s+/g, "-")}-nologinvpn.conf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Config downloaded");
  };

  const copy = async (text: string, which: "priv" | "pub") => {
    await navigator.clipboard.writeText(text);
    if (which === "priv") {
      setCopiedPriv(true);
      setTimeout(() => setCopiedPriv(false), 2000);
    } else {
      setCopiedPub(true);
      setTimeout(() => setCopiedPub(false), 2000);
    }
    toast.success("Copied!");
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Devices & Keys</h1>
          <p className="text-muted-foreground text-sm">
            Manage your WireGuard &amp; Amnezia devices. Max {MAX_DEVICES} devices allowed.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          onClick={() => setAddOpen(true)}
          disabled={devices.length >= MAX_DEVICES}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Device
        </Button>
      </div>

      {/* ── Device list ── */}
      {devices.length === 0 ? (
        <div className="card-glass rounded-xl p-12 text-center">
          <Cpu className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-medium mb-1">No devices yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first device to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <div key={device.id} className="card-glass rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                  <Cpu className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm">{device.name}</span>
                    <Badge
                      className={`text-xs ${device.protocol === "amnezia"
                        ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                        : "bg-sky-500/15 text-sky-400 border-sky-500/30"}`}
                    >
                      {device.protocol === "amnezia" ? "Amnezia WG" : "WireGuard"}
                    </Badge>
                    {device.nodeId ? (
                      <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground border-border/60">
                        No Server
                      </Badge>
                    )}
                  </div>

                  {/* Public key */}
                  <p className="text-xs font-mono text-muted-foreground truncate mb-3">
                    {device.publicKey}
                  </p>

                  {/* Node selector */}
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" />
                      <span>Server:</span>
                    </div>
                    <Select
                      value={device.nodeId || "none"}
                      onValueChange={(v) => handleNodeChange(device.id, v)}
                    >
                      <SelectTrigger className="h-7 text-xs w-52 bg-input border-border/60">
                        <SelectValue placeholder="Select server..." />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border/60">
                        <SelectItem value="none" className="text-xs text-muted-foreground">
                          No server selected
                        </SelectItem>
                        {nodes
                          .filter((n) => n.protocol === device.protocol)
                          .map((n) => (
                            <SelectItem key={n.id} value={n.id} className="text-xs">
                              {countryFlag(n.country)} {n.name} — {n.location}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {device.nodeLocation && (
                    <p className="text-xs text-muted-foreground mt-1.5 ml-5">
                      {device.nodeLocation} · {device.nodeEndpoint}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={() => handleDownloadConfig(device)}
                    title={`Download ${device.protocol === "amnezia" ? "Amnezia WG" : "WireGuard"} config`}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(device.id)}
                    title="Delete device"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Slot indicators ── */}
      <div className="flex gap-2">
        {Array.from({ length: MAX_DEVICES }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < devices.length ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {devices.length}/{MAX_DEVICES} device slots used
      </p>

      {/* ── Add device dialog ── */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="bg-card border-border/60 max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Keys are generated in your browser — the private key never leaves your device.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Device name */}
            <div className="space-y-1.5">
              <Label htmlFor="devname" className="text-sm">Device Name</Label>
              <Input
                id="devname"
                placeholder="e.g. MacBook Pro, iPhone 15"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-input border-border/60"
              />
            </div>

            {/* Protocol selector */}
            <div className="space-y-1.5">
              <Label className="text-sm">Protocol</Label>
              <div className="flex rounded-lg border border-border/60 overflow-hidden text-sm">
                <button
                  onClick={() => setNewProtocol("wireguard")}
                  className={`flex-1 py-2 transition-colors ${newProtocol === "wireguard" ? "bg-sky-500/10 text-sky-400 font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  WireGuard
                </button>
                <button
                  onClick={() => setNewProtocol("amnezia")}
                  className={`flex-1 py-2 transition-colors border-l border-border/60 ${newProtocol === "amnezia" ? "bg-purple-500/10 text-purple-400 font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Amnezia WG
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {newProtocol === "amnezia"
                  ? "Amnezia WG adds obfuscation to hide VPN traffic from deep packet inspection."
                  : "Standard WireGuard — fast, modern, and widely supported."}
              </p>
            </div>

            {/* Key mode toggle */}
            <div className="flex rounded-lg border border-border/60 overflow-hidden text-sm">
              <button
                onClick={() => { setKeyMode("generate"); setWgKeys(null); }}
                className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 transition-colors ${
                  keyMode === "generate"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Key className="h-3.5 w-3.5" /> Generate
              </button>
              <button
                onClick={() => { setKeyMode("paste"); setWgKeys(null); }}
                className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 transition-colors border-l border-border/60 ${
                  keyMode === "paste"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Copy className="h-3.5 w-3.5" /> Paste key
              </button>
            </div>

            {/* Generate mode */}
            {keyMode === "generate" && (
              <div className="space-y-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-border/60 hover:border-primary/40"
                  onClick={handleGenerateKeys}
                  disabled={generatingKeys}
                >
                  {generatingKeys ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                  ) : (
                    <Key className="h-3.5 w-3.5 mr-2" />
                  )}
                  {wgKeys ? "Regenerate Keys" : "Generate WireGuard Keys"}
                </Button>

                {wgKeys ? (
                  <div className="space-y-2">
                    {/* Private key */}
                    <div className="bg-muted/40 border border-amber-500/20 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-amber-400">
                          Private Key — save this, never share
                        </span>
                        <div className="flex gap-1.5">
                          <button onClick={() => setShowPrivKey((v) => !v)} className="text-muted-foreground hover:text-foreground">
                            {showPrivKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => copy(wgKeys.privateKey, "priv")} className="text-muted-foreground hover:text-foreground">
                            {copiedPriv ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                      <p className="font-mono text-xs break-all">
                        {showPrivKey ? wgKeys.privateKey : "•".repeat(44)}
                      </p>
                    </div>
                    {/* Public key */}
                    <div className="bg-muted/40 border border-border/60 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-primary">Public Key</span>
                        <button onClick={() => copy(wgKeys.publicKey, "pub")} className="text-muted-foreground hover:text-foreground">
                          {copiedPub ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <p className="font-mono text-xs break-all">{wgKeys.publicKey}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Copy your private key now — we only store the public key.
                    </p>
                  </div>
                ) : (
                  <div className="bg-muted/30 rounded-lg p-4 text-center text-sm text-muted-foreground border border-dashed border-border/50">
                    Click above to generate a key pair in your browser.
                  </div>
                )}
              </div>
            )}

            {/* Paste mode */}
            {keyMode === "paste" && (
              <div className="space-y-1.5">
                <Label className="text-sm">WireGuard Public Key</Label>
                <Input
                  placeholder="base64-encoded public key…"
                  value={pastedPublicKey}
                  onChange={(e) => setPastedPublicKey(e.target.value)}
                  className="font-mono text-xs bg-input border-border/60"
                  spellCheck={false}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Paste the public key from your existing WireGuard config or client.
                </p>
              </div>
            )}

            <Separator />

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                onClick={handleAddDevice}
                disabled={saving || !newName.trim() || (keyMode === "generate" ? !wgKeys : !pastedPublicKey.trim())}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Device
              </Button>
              <Button
                variant="outline"
                className="border-border/60"
                onClick={() => { setAddOpen(false); resetForm(); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
