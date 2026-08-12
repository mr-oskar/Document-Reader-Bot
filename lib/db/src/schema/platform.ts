import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const appRoleEnum = pgEnum("app_role", [
  "advertiser",
  "creator",
  "reviewer",
  "accountant",
  "admin",
  "super_admin",
  "ai_operator",
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "under_review",
  "approved",
  "funding",
  "active",
  "paused",
  "completed",
  "settlement",
  "closed",
  "archived",
]);

export const reviewModeEnum = pgEnum("review_mode", ["human", "ai"]);

export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "approved",
  "rejected",
  "withdrawn",
]);

export const contentStatusEnum = pgEnum("content_status", [
  "submitted",
  "in_review",
  "approved",
  "rejected",
  "needs_changes",
  "escalated",
]);

export const reviewDecisionEnum = pgEnum("review_decision", [
  "approved",
  "rejected",
  "needs_changes",
  "escalated",
]);

export const walletStatusEnum = pgEnum("wallet_status", [
  "active",
  "suspended",
]);

export const ledgerEntryTypeEnum = pgEnum("ledger_entry_type", [
  "debit",
  "credit",
]);

export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    email: text("email"),
    displayName: text("display_name"),
    role: appRoleEnum("role").notNull().default("creator"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    clerkUserIdUnique: uniqueIndex("users_clerk_user_id_unique").on(table.clerkUserId),
  }),
);

export const organizationsTable = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organizationMembersTable = pgTable(
  "organization_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    role: appRoleEnum("role").notNull().default("advertiser"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    memberUnique: uniqueIndex("organization_members_unique").on(table.organizationId, table.userId),
  }),
);

export const campaignsTable = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => usersTable.id),
  name: text("name").notNull(),
  brief: text("brief"),
  status: campaignStatusEnum("status").notNull().default("draft"),
  budgetMinor: integer("budget_minor").notNull().default(0),
  currency: text("currency").notNull().default("SAR"),
  cpvMinor: integer("cpv_minor").notNull().default(0),
  targetViews: integer("target_views").notNull().default(0),
  target: jsonb("target").$type<Record<string, unknown>>().notNull().default({}),
  requirements: jsonb("requirements").$type<Record<string, unknown>>().notNull().default({}),
  platforms: text("platforms").array().notNull().default([]),
  startsOn: timestamp("starts_on", { withTimezone: true }),
  endsOn: timestamp("ends_on", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const applicationsTable = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").notNull().references(() => campaignsTable.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  status: applicationStatusEnum("status").notNull().default("pending"),
  pitch: text("pitch"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const contentSubmissionsTable = pgTable("content_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").notNull().references(() => campaignsTable.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  applicationId: uuid("application_id").references(() => applicationsTable.id),
  postUrl: text("post_url").notNull(),
  caption: text("caption"),
  hashtags: text("hashtags").array().notNull().default([]),
  platform: text("platform").notNull(),
  status: contentStatusEnum("status").notNull().default("submitted"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const reviewsTable = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentSubmissionId: uuid("content_submission_id").notNull().references(() => contentSubmissionsTable.id, { onDelete: "cascade" }),
  reviewerId: uuid("reviewer_id").references(() => usersTable.id),
  decision: reviewDecisionEnum("decision"),
  checklist: jsonb("checklist").$type<Record<string, boolean>>().notNull().default({}),
  reason: text("reason"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
});

export const walletsTable = pgTable("wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  status: walletStatusEnum("status").notNull().default("active"),
  currency: text("currency").notNull().default("SAR"),
  availableMinor: integer("available_minor").notNull().default(0),
  pendingMinor: integer("pending_minor").notNull().default(0),
  withdrawnMinor: integer("withdrawn_minor").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const ledgerAccountsTable = pgTable("ledger_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerUserId: uuid("owner_user_id").references(() => usersTable.id),
  organizationId: uuid("organization_id").references(() => organizationsTable.id),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("SAR"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ledgerTransactionsTable = pgTable("ledger_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  idempotencyKey: text("idempotency_key").notNull(),
  referenceType: text("reference_type").notNull(),
  referenceId: uuid("reference_id"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  idempotencyUnique: uniqueIndex("ledger_transactions_idempotency_unique").on(table.idempotencyKey),
}));

export const ledgerEntriesTable = pgTable("ledger_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: uuid("transaction_id").notNull().references(() => ledgerTransactionsTable.id, { onDelete: "restrict" }),
  accountId: uuid("account_id").notNull().references(() => ledgerAccountsTable.id, { onDelete: "restrict" }),
  entryType: ledgerEntryTypeEnum("entry_type").notNull(),
  amountMinor: integer("amount_minor").notNull(),
  currency: text("currency").notNull().default("SAR"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notificationsTable = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorUserId: uuid("actor_user_id").references(() => usersTable.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  before: jsonb("before").$type<Record<string, unknown> | null>(),
  after: jsonb("after").$type<Record<string, unknown> | null>(),
  reason: text("reason"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformSettingsTable = pgTable("platform_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  updatedByUserId: uuid("updated_by_user_id").references(() => usersTable.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  keyUnique: uniqueIndex("platform_settings_key_unique").on(table.key),
}));

export const insertUserSchema = createInsertSchema(usersTable);
export const insertCampaignSchema = createInsertSchema(campaignsTable);
export const insertApplicationSchema = createInsertSchema(applicationsTable);
export const insertContentSubmissionSchema = createInsertSchema(contentSubmissionsTable);
export const insertReviewSchema = createInsertSchema(reviewsTable);
export const insertPlatformSettingSchema = createInsertSchema(platformSettingsTable);

export type User = typeof usersTable.$inferSelect;
export type Campaign = typeof campaignsTable.$inferSelect;
export type Application = typeof applicationsTable.$inferSelect;
export type ContentSubmission = typeof contentSubmissionsTable.$inferSelect;
export type Review = typeof reviewsTable.$inferSelect;
export type PlatformSetting = typeof platformSettingsTable.$inferSelect;

export const appRoleSchema = z.enum(["advertiser", "creator", "reviewer", "accountant", "admin", "super_admin", "ai_operator"]);
export const reviewModeSchema = z.enum(["human", "ai"]);