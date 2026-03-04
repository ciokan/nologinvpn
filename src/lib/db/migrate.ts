import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import path from "path";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("⏳ Connecting to database...");
  const pool = new Pool({ connectionString: url });

  const db = drizzle(pool);

  console.log("⏳ Running migrations...");
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });

  console.log("✅ All migrations applied.");
  await pool.end();
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
