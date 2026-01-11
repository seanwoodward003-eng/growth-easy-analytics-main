// drizzle.config.ts (in project root)
import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/schema.ts",  // or "./src/db/schema.ts" – whatever you chose
  dialect: "sqlite",         // ← CHANGE THIS (Turso works perfectly with sqlite dialect)
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config;