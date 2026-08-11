# Contributing to AdPerform

1. Read `docs/PROJECT_STATUS.md` and the full requirements document before starting.
2. Preserve existing behavior and use incremental changes.
3. Keep business logic in domain/application modules, not UI components.
4. Add API contracts to OpenAPI before writing callers.
5. Add loading, empty, error, retry, and success states to new screens.
6. Use integer minor units for money and write audit/idempotency behavior for sensitive flows.
7. Run `pnpm run typecheck` and the relevant package checks before handoff.
8. Update `docs/PROJECT_STATUS.md` with the actual result and next step.

The visual web app lives in `artifacts/adperform`; the Express API lives in `artifacts/api-server`.