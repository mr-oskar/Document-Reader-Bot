# AdPerform — Database Contract

PostgreSQL is the system of record. Large media files belong in S3-compatible Object Storage; analytics events can move to ClickHouse later.

## Target domains

- `users`, `user_sessions`, `user_verifications`
- `organizations`, `organization_members`, `roles`, `permissions`
- `advertiser_profiles`, `creator_profiles`, `creator_social_accounts`
- `campaigns`, `campaign_targets`, `campaign_requirements`, `campaign_assets`
- `applications`, `content_submissions`, `content_assets`, `reviews`
- `view_events`, `verified_views`, `fraud_findings`
- `wallets`, `ledger_accounts`, `ledger_transactions`, `ledger_entries`
- `payment_transactions`, `payout_requests`, `escrow_reservations`
- `notifications`, `notification_preferences`, `messages`
- `audit_logs`, `admin_settings`, `tier_rules`, `disputes`

## Required invariants

- IDs are opaque UUIDs.
- Tenant-owned records include `organization_id` where applicable.
- Campaign state is an enum/state machine, not a single boolean.
- Money uses `amount_minor` plus `currency`; never floating point.
- Ledger transactions balance debits and credits and are immutable.
- Content performance starts after manual approval.
- View records preserve raw, validated, fraud-checked, verified, and billable status.
- Sensitive tables have indexes for tenant, status, created time, and foreign keys.

## Migration policy

Schema changes must be represented by the workspace's Drizzle migration/push workflow. Never add startup DDL or silently replace an existing database.

## Seed target

Development seed should include one admin, reviewer, accountant, advertiser, creator, active campaign, application, submitted content, review, wallet projection, and ledger transaction.