import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import crypto from "crypto";

// ────────────────────────────────────────────────────────────────
// ENCRYPTION HELPERS (for Shopify tokens)
// Use a 32-byte key from env (generate with: openssl rand -hex 32)
// Store ENCRYPTION_KEY as Vercel env var (secret)
// ────────────────────────────────────────────────────────────────

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is not set");
}

if (ENCRYPTION_KEY.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be a 32-byte hex string (64 chars)");
}

function encrypt(value: string): string {
  if (!value) return "";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(ENCRYPTION_KEY!, "hex"), // ! = safe after guard
    iv
  );
  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

function decrypt(encrypted: string): string {
  if (!encrypted) return "";
  const [ivHex, encryptedHex, authTagHex] = encrypted.split(":");
  if (!ivHex || !encryptedHex || !authTagHex) {
    throw new Error("Invalid encrypted data format");
  }
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(ENCRYPTION_KEY!, "hex"), // ! = safe after guard
    iv
  );
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// ────────────────────────────────────────────────────────────────
// SCHEMA TABLES
// ────────────────────────────────────────────────────────────────

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").unique().notNull(),
  stripeId: text("stripe_id"),
  shopifyShop: text("shopify_shop"),
  ga4Connected: integer("ga4_connected").default(0),
  hubspotConnected: integer("hubspot_connected").default(0),
  ga4AccessToken: text("ga4_access_token"),
  ga4RefreshToken: text("ga4_refresh_token"),
  ga4PropertyId: text("ga4_property_id"),
  
  // Shopify token – ENCRYPTED on insert/update
  shopifyAccessToken: text("shopify_access_token")
    .$type<string>()
    .$onInsert((value) => encrypt(value))
    .$onUpdate((value) => encrypt(value)),

  hubspotRefreshToken: text("hubspot_refresh_token"),
  hubspotAccessToken: text("hubspot_access_token"),
  gdprConsented: integer("gdpr_consented").default(0),

  // Auto-fix: marketing_consented defaults to 0 if missing on insert/update
  marketingConsented: integer("marketing_consented")
    .default(0)
    .$onInsert(() => 0)
    .$onUpdate(() => 0),

  ga4LastRefreshed: text("ga4_last_refreshed"),
  createdAt: text("created_at").default("(datetime('now'))"),
  trialEnd: text("trial_end"),
  subscriptionStatus: text("subscription_status").default("trial"),

  verificationToken: text("verification_token"),
  verificationTokenExpires: text("verification_token_expires"),
});

export const metrics = sqliteTable(
  "metrics",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id),
    date: text("date").default("(datetime('now'))"),
    revenue: real("revenue").default(0),
    churnRate: real("churn_rate").default(0),
    atRisk: integer("at_risk").default(0),
    ltv: real("ltv").default(0),
    cac: real("cac").default(0),
    topChannel: text("top_channel").default(""),
    acquisitionCost: real("acquisition_cost").default(0),
    retentionRate: real("retention_rate").default(0),
    aov: real("aov").default(0),
    repeatRate: real("repeat_rate").default(0),
    ltvNew: real("ltv_new").default(0),
    ltvReturning: real("ltv_returning").default(0),
  },
  (table) => ({
    userIdx: index("idx_metrics_user").on(table.userId),
  })
);

export const rateLimits = sqliteTable(
  "rate_limits",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    endpoint: text("endpoint").notNull(),
    timestamp: text("timestamp").default("CURRENT_TIMESTAMP"),
  },
  (table) => ({
    userEndpointTimestampIdx: index("idx_rate_limits_user_endpoint").on(
      table.userId,
      table.endpoint,
      table.timestamp
    ),
  })
);

export const metricsHistory = sqliteTable("metrics_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  syncDate: text("sync_date"),
  revenue: real("revenue"),
  churnRate: real("churn_rate"),
  atRisk: integer("at_risk"),
  aov: real("aov"),
  repeatRate: real("repeat_rate"),
});

// ORDERS TABLE — added for webhook
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  totalPrice: real("total_price").notNull(),
  createdAt: text("created_at").notNull(),
  financialStatus: text("financial_status").notNull(),
  customerId: integer("customer_id"),
  sourceName: text("source_name"),
  shopDomain: text("shop_domain").notNull(),
}, (table) => ({
  userIdIdx: index("idx_orders_user_id").on(table.userId),
  dateIdx: index("idx_orders_created_at").on(table.createdAt),
}));