// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",           // ← change if you put schema.ts somewhere else
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config;