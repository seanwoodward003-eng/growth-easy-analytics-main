// src/db/schema.ts
import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

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
  shopifyAccessToken: text("shopify_access_token"),
  hubspotRefreshToken: text("hubspot_refresh_token"),
  hubspotAccessToken: text("hubspot_access_token"),
  gdprConsented: integer("gdpr_consented").default(0),
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

// ────────────────────────────────────────────────────────────────
// ORDERS TABLE — added here for webhook insertion
// ────────────────────────────────────────────────────────────────
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  totalPrice: real("total_price").notNull(),
  createdAt: text("created_at").notNull(), // ISO string from Shopify (e.g. "2026-01-13T18:37:00Z")
  financialStatus: text("financial_status").notNull(),
  customerId: integer("customer_id"),
  sourceName: text("source_name"),
}, (table) => ({
  userIdIdx: index("idx_orders_user_id").on(table.userId),
  createdAtIdx: index("idx_orders_created_at").on(table.createdAt),
}));