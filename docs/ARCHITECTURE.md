# AdPerform — Architecture

## Principle

Use a modular monolith first, with clean boundaries and event-driven seams. Extract heavy services only when load or ownership justifies it.

```text
User
  ↓
React Web (RTL/LTR, role-aware UI)
  ↓
API /api/v1
  ↓
Application Services
  ↓
Domain Modules
  ├─ Auth & Users
  ├─ Organizations & RBAC
  ├─ Campaigns & Applications
  ├─ Content & Manual Review
  ├─ Views & Analytics
  ├─ Wallet / Ledger / Payments
  ├─ Notifications / Messaging
  ├─ Fraud / AI adapters
  └─ Admin / Accounting / Audit
  ↓
Repositories
  ↓
PostgreSQL + Redis + Object Storage + Queue
```

## Dependency rules

- UI never talks to the database.
- Controllers validate and delegate; they do not contain financial or campaign rules.
- Domain services own state transitions and invariants.
- Repositories own persistence.
- Financial mutations are idempotent and auditable.
- Fraud findings never mutate balances directly.

## Core abstractions

- `VerificationEngine`: `ManualVerificationProvider` now; AI and hybrid providers later.
- `SocialPlatformProvider`: TikTok, Instagram, YouTube adapters.
- `PaymentProvider`: provider-neutral payment and payout boundary.
- `EarningsEngine`: qualified views → CPV → creator/platform shares.
- `TierRuleEngine`: dynamic thresholds, benefits, commission, and eligibility.
- `FraudDetectionEngine`: rule-based findings first, AI later.
- `CreatorMatchingEngine`: rule-based matching first, ML later.

## Campaign lifecycle

```text
DRAFT → UNDER_REVIEW → APPROVED → FUNDING → ACTIVE
  → PAUSED → COMPLETED → SETTLEMENT → CLOSED → ARCHIVED
```

Every transition records actor, timestamp, reason, and audit metadata.

## Verification lifecycle

```text
Content submitted → Review queue → Manual checklist
  → APPROVED | REJECTED | NEEDS_CHANGES | ESCALATED
  → performance tracking only after approval
```

## Financial flow

```text
Advertiser deposit → Reserved funds → Consumed
  → Distributed creator/platform shares
  → Remaining refund when rules allow
```

Balances are projections. The immutable ledger is the source of truth.