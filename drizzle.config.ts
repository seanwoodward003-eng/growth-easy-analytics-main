import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",  // change to your exact schema path if different
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config;