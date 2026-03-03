/**
 * Seed script — run with:
 *   npx tsx src/lib/db/seed.ts
 */
import "dotenv/config";
import { db } from "./index";
import { plans, nodes } from "./schema";

async function main() {
  console.log("🌱 Seeding database...");

  // Plans
  await db.delete(plans);
  const seededPlans = await db
    .insert(plans)
    .values([
      { label: "1 Month", durationMonths: 1, priceUsd: "6.99", active: true },
      { label: "3 Months", durationMonths: 3, priceUsd: "17.99", active: true },
      { label: "6 Months", durationMonths: 6, priceUsd: "29.99", active: true },
      { label: "12 Months", durationMonths: 12, priceUsd: "49.99", active: true },
    ])
    .returning();
  console.log(`✓ Inserted ${seededPlans.length} plans`);

  // Nodes — 4 WireGuard + 4 Amnezia (same locations, different ports)
  // Amnezia params are placeholders — replace with real server values
  await db.delete(nodes);
  const seededNodes = await db
    .insert(nodes)
    .values([
      // ── WireGuard nodes ──────────────────────────────────────────────────
      {
        name: "US-NY-001",
        location: "New York, USA",
        datacenter: "Vultr-EWR",
        country: "US",
        ipAddress: "149.28.100.1",
        publicKey: "PLACEHOLDER_SERVER_PUBLIC_KEY",
        endpoint: "149.28.100.1:51820",
        dns: "1.1.1.1",
        protocol: "wireguard" as const,
        active: true,
      },
      {
        name: "DE-FRA-001",
        location: "Frankfurt, Germany",
        datacenter: "Hetzner-FSN1",
        country: "DE",
        ipAddress: "5.75.100.1",
        publicKey: "PLACEHOLDER_SERVER_PUBLIC_KEY_3",
        endpoint: "5.75.100.1:51820",
        dns: "1.1.1.1",
        protocol: "wireguard" as const,
        active: true,
      },
      {
        name: "SG-SGP-001",
        location: "Singapore",
        datacenter: "Vultr-SGP",
        country: "SG",
        ipAddress: "139.180.100.1",
        publicKey: "PLACEHOLDER_SERVER_PUBLIC_KEY_5",
        endpoint: "139.180.100.1:51820",
        dns: "1.1.1.1",
        protocol: "wireguard" as const,
        active: true,
      },
      {
        name: "GB-LON-001",
        location: "London, UK",
        datacenter: "Hetzner-London",
        country: "GB",
        ipAddress: "5.161.100.1",
        publicKey: "PLACEHOLDER_SERVER_PUBLIC_KEY_7",
        endpoint: "5.161.100.1:51820",
        dns: "1.1.1.1",
        protocol: "wireguard" as const,
        active: true,
      },
      // ── Amnezia nodes (obfuscated WireGuard) ─────────────────────────────
      {
        name: "US-NY-002-AWG",
        location: "New York, USA",
        datacenter: "Vultr-EWR",
        country: "US",
        ipAddress: "149.28.100.2",
        publicKey: "PLACEHOLDER_AWG_PUBLIC_KEY",
        endpoint: "149.28.100.2:51821",
        dns: "1.1.1.1",
        protocol: "amnezia" as const,
        amneziaParams: { jc: 4, jmin: 40, jmax: 70, s1: 0, s2: 0, h1: 1688918161, h2: 1540919800, h3: 2107659401, h4: 2082717442 },
        active: true,
      },
      {
        name: "NL-AMS-001-AWG",
        location: "Amsterdam, Netherlands",
        datacenter: "Vultr-AMS",
        country: "NL",
        ipAddress: "95.179.100.1",
        publicKey: "PLACEHOLDER_AWG_PUBLIC_KEY_2",
        endpoint: "95.179.100.1:51821",
        dns: "1.1.1.1",
        protocol: "amnezia" as const,
        amneziaParams: { jc: 4, jmin: 40, jmax: 70, s1: 0, s2: 0, h1: 2014612219, h2: 1357398438, h3: 876547234, h4: 3201984762 },
        active: true,
      },
      {
        name: "JP-TKY-001-AWG",
        location: "Tokyo, Japan",
        datacenter: "Vultr-NRT",
        country: "JP",
        ipAddress: "139.180.200.1",
        publicKey: "PLACEHOLDER_AWG_PUBLIC_KEY_3",
        endpoint: "139.180.200.1:51821",
        dns: "1.1.1.1",
        protocol: "amnezia" as const,
        amneziaParams: { jc: 6, jmin: 50, jmax: 100, s1: 0, s2: 0, h1: 1294567891, h2: 2987654321, h3: 1023456789, h4: 3456789012 },
        active: true,
      },
      {
        name: "CA-TOR-001-AWG",
        location: "Toronto, Canada",
        datacenter: "Vultr-YTO",
        country: "CA",
        ipAddress: "45.32.100.1",
        publicKey: "PLACEHOLDER_AWG_PUBLIC_KEY_4",
        endpoint: "45.32.100.1:51821",
        dns: "1.1.1.1",
        protocol: "amnezia" as const,
        amneziaParams: { jc: 4, jmin: 40, jmax: 70, s1: 0, s2: 0, h1: 874561234, h2: 2135678901, h3: 3012345678, h4: 1987654321 },
        active: true,
      },
    ])
    .returning();
  console.log(`✓ Inserted ${seededNodes.length} nodes (WireGuard + Amnezia)`);

  console.log("✅ Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
