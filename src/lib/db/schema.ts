import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  numeric,
  pgEnum,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const paymentMethodEnum = pgEnum("payment_method", [
  "stripe",
  "btc",
  "eth",
  "usdt",
  "xmr",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "confirmed",
  "failed",
  "expired",
]);

export const protocolEnum = pgEnum("protocol", ["wireguard", "amnezia"]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  hash: text("hash").notNull().unique(), // the unique access key
  createdAt: timestamp("created_at").defaultNow().notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
});

// ─── Plans ────────────────────────────────────────────────────────────────────

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: text("label").notNull(), // e.g. "1 Month", "3 Months"
  durationMonths: integer("duration_months").notNull(),
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).notNull(),
  active: boolean("active").default(true).notNull(),
});

// ─── Nodes ────────────────────────────────────────────────────────────────────

// Amnezia WireGuard obfuscation parameters (only relevant when protocol = "amnezia")
export interface AmneziaParams {
  jc: number;   // Junk packet count (1–128)
  jmin: number; // Min junk packet size
  jmax: number; // Max junk packet size
  s1: number;   // Init packet junk bytes
  s2: number;   // Response packet junk bytes
  h1: number;   // Init packet magic header (uint32)
  h2: number;   // Response packet magic header (uint32)
  h3: number;   // Cookie packet magic header (uint32)
  h4: number;   // Transport packet magic header (uint32)
}

export const nodes = pgTable("nodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(), // e.g. "US-NY-001"
  location: text("location").notNull(), // e.g. "New York, US"
  datacenter: text("datacenter").notNull(), // e.g. "Vultr-EWR"
  country: text("country").notNull(), // ISO 3166-1 alpha-2, e.g. "US"
  ipAddress: text("ip_address").notNull(),
  publicKey: text("public_key").notNull(), // server WG / AWG public key
  endpoint: text("endpoint").notNull(), // host:port
  dns: text("dns").default("1.1.1.1").notNull(),
  protocol: protocolEnum("protocol").default("wireguard").notNull(),
  amneziaParams: json("amnezia_params").$type<AmneziaParams>(),
  active: boolean("active").default(true).notNull(),
});

// ─── Devices ─────────────────────────────────────────────────────────────────

export const devices = pgTable("devices", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g. "MacBook Pro", "iPhone"
  publicKey: text("public_key").notNull().unique(),
  protocol: protocolEnum("protocol").default("wireguard").notNull(),
  nodeId: uuid("node_id").references(() => nodes.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: uuid("plan_id").references(() => plans.id, { onDelete: "set null" }),
  amountUsd: numeric("amount_usd", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentId: text("payment_id"), // stripe session id or crypto tx hash
  status: transactionStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  devices: many(devices),
  transactions: many(transactions),
}));

export const devicesRelations = relations(devices, ({ one }) => ({
  user: one(users, { fields: [devices.userId], references: [users.id] }),
  node: one(nodes, { fields: [devices.nodeId], references: [nodes.id] }),
}));

export const nodesRelations = relations(nodes, ({ many }) => ({
  devices: many(devices),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  plan: one(plans, { fields: [transactions.planId], references: [plans.id] }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  transactions: many(transactions),
}));

// ─── TypeScript type inference ────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Plan = typeof plans.$inferSelect;
export type Node = typeof nodes.$inferSelect;
export type NewNode = typeof nodes.$inferInsert;
export type Device = typeof devices.$inferSelect;
export type NewDevice = typeof devices.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Protocol = "wireguard" | "amnezia";
