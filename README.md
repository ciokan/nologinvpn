# NoLoginVPN — Next.js App

Anonymous WireGuard VPN service. No account, no email, no password.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind v4 + shadcn/ui (dark VPN theme) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Single access key → 30-day JWT cookie |
| Payments | Stripe + Crypto (BTC/ETH/USDT/XMR) |
| WireGuard | WebCrypto X25519 key generation (browser-only) |

## Quick Start

```bash
# 1. Copy env
cp .env.example .env.local
# Fill in: DATABASE_URL, JWT_SECRET, STRIPE keys, crypto wallet addresses

# 2. Install
npm install

# 3. Create DB schema
npm run db:push

# 4. Seed plans & nodes
npm run db:seed

# 5. Dev
npm run dev
```

## Database Commands

```bash
npm run db:generate   # Generate migration files from schema
npm run db:migrate    # Apply migrations
npm run db:push       # Push schema directly (dev shortcut)
npm run db:studio     # Drizzle Studio GUI
npm run db:seed       # Seed plans + server nodes
```

## Auth Flow

1. **New user**: `/access` → click "Generate" → hash created + stored → 30-day cookie set → `/dashboard`
2. **Returning user**: `/access` → paste hash → cookie set → `/dashboard`
3. **No password recovery** — by design. User is warned to back up the hash.

## Dashboard Features

| Feature | Notes |
|---|---|
| Subscription status | Active/expired + days remaining |
| Plan purchase | 1/3/6/12 month with DB prices |
| Stripe checkout | Webhook auto-extends subscription |
| Crypto payment | QR code + wallet address per currency |
| Device management | Max 3 devices |
| WireGuard key gen | Browser-side via WebCrypto X25519 |
| Node selection | Per-device, changeable any time |
| Config download | Client prompts for private key, builds `.conf` |

## Key Security Decisions

- **Private key never leaves browser** — we store only the public key
- **No email/phone** — access key is the only credential
- **Hash stored in DB** — used to verify login, not recoverable from it
- **JWT session** — signed with `JWT_SECRET`, 30-day expiry, HTTP-only cookie
- **Stripe lazy import** — Stripe SDK initialized only when keys are present

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── access/page.tsx       # Login / key generation
│   ├── dashboard/page.tsx    # Dashboard (server component)
│   └── api/
│       ├── auth/             # generate, login, logout, me
│       ├── devices/          # CRUD + WG config endpoint
│       ├── nodes/            # Node list
│       ├── plans/            # Plan list
│       └── payment/
│           ├── stripe/       # Checkout + webhook
│           └── crypto/       # Wallet address + QR
├── components/
│   ├── ui/                   # shadcn components
│   └── dashboard/
│       ├── DashboardShell.tsx
│       ├── OverviewTab.tsx
│       ├── DevicesTab.tsx
│       └── PurchaseTab.tsx
└── lib/
    ├── db/
    │   ├── index.ts          # Drizzle client
    │   ├── schema.ts         # Full schema + relations + types
    │   └── seed.ts           # Seed script
    ├── session.ts            # JWT session helpers
    └── hash.ts               # Access key generator
```

## Stripe Webhook Setup

```bash
# Local testing
stripe listen --forward-to localhost:3000/api/payment/stripe/webhook

# Production: set STRIPE_WEBHOOK_SECRET from Stripe dashboard
```

## Adding More Nodes

Edit `src/lib/db/seed.ts` and add entries, then `npm run db:seed`. Or insert directly:

```sql
INSERT INTO nodes (name, location, datacenter, country, ip_address, public_key, endpoint)
VALUES ('AU-SYD-001', 'Sydney, Australia', 'Vultr-SYD', 'AU', '...', '...', '...:51820');
```
