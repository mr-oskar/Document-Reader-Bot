# AdPerform

AdPerform منصة تسويق عبر المؤثرين تعتمد على الأداء (CPV / Pay-Per-Performance)، وتربط المعلنين بصناع المحتوى مع مراجعة بشرية للمحتوى وتتبع للمشاهدات والأرباح.

## Run & Operate

- `pnpm --filter @workspace/adperform run dev` — run the AdPerform web app
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required backend env: `DATABASE_URL` — Postgres connection string
- `SESSION_SECRET` is managed as a Replit secret and must not be committed or printed.

## Current implementation status

The first product surface is implemented in `artifacts/adperform` with RTL Arabic UI, role-based demo navigation, advertiser/creator/reviewer/admin workspaces, campaign builder, marketplace, manual review, wallet flows, analytics views, notification center, settings, dark/light theme, responsive navigation, and local demo state. Campaign creatives use local CSS/SVG-style visual panels so the app does not depend on remote image hosts.

This is a frontend-first MVP surface. Authentication, persistence, real payment providers, object storage, PostgreSQL domain tables, queues, social APIs, and production authorization are documented as the next implementation layers and are intentionally not represented as fake production behavior.

## Source of truth

- `attached_assets/وثيقه_متطلبات_انشاء_مشروع_ويب_اقراءه_كاملا__1786469415807.md` — complete Arabic master requirements
- `docs/PROJECT_STATUS.md` — what is implemented, deferred, and the next concrete work package
- `docs/ARCHITECTURE.md` — module boundaries and scaling principles
- `docs/DATABASE.md` — target PostgreSQL/domain model and ledger rules
- `docs/API.md` — versioned API surface and contract-first rules
- `docs/SECURITY.md` — security and authorization requirements
- `docs/DEPLOYMENT.md` — Replit/local deployment notes
- `docs/SCALING.md` — staged path from MVP to 2M users

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Web: React + Vite + TypeScript + Tailwind CSS
- API: Express 5 (modular-monolith foundation)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/adperform/src/` — user-facing web application
- `artifacts/api-server/src/` — API entrypoint and routes
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/api-client-react/` and `lib/api-zod/` — generated API clients/schemas
- `lib/db/src/schema/` — PostgreSQL schema source
- `artifacts/mockup-sandbox/` — isolated canvas component preview server

## Architecture decisions

- Start with a modular monolith; keep domain boundaries explicit before extracting services.
- MVP verification is human-led. AI providers are future adapters and cannot settle financial balances directly.
- Money is represented as integer minor units and rebuilt from an immutable double-entry ledger.
- Frontend server state belongs to TanStack Query when connected to the API; local demo state is isolated in the web artifact until contracts and persistence are implemented.
- Arabic/RTL is the primary presentation, with localization-ready copy and theme tokens.

## Product

Advertisers create and fund campaigns, define audience/content requirements, discover creators, and monitor verified performance. Creators discover eligible campaigns, apply, submit published content for manual review, and track earnings. Reviewers approve, reject, request changes, or escalate content. Admin and accounting roles govern users, rules, finance, and auditability.

## User preferences

- Preserve the existing workspace structure and stack; add incrementally instead of rewriting.
- Do not claim production readiness for demo/local state.
- Continue from `docs/PROJECT_STATUS.md` and update it after each meaningful milestone.

## Gotchas

- Artifact workflows provide `PORT` and `BASE_PATH`; do not start artifact dev servers with guessed values.
- Use `pnpm --filter @workspace/adperform run typecheck` for the web artifact.
- API changes begin in `lib/api-spec/openapi.yaml`, then run codegen before importing generated hooks.
- Never put secrets, JWT material, payment keys, or database credentials in Git.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
