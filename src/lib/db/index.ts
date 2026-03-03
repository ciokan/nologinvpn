import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Pool is created lazily (connects only on first query)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost/nologinvpn",
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;
