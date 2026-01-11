// migrate.ts  (simple one-time migration runner)
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const db = drizzle(client);

  console.log("Starting migrations...");

  try {
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
    console.log("Migrations applied successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});