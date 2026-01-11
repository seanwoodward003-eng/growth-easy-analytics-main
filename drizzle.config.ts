// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",  // your path
  out: "./drizzle/migrations",   // ← new: folder for generated SQL files
  dialect: "sqlite",             // or "turso" if your kit version supports it
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config;