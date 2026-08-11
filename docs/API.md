# AdPerform — API Contract

The source of truth is `lib/api-spec/openapi.yaml`. The server is mounted below `/api`; future domain routes are versioned below `/api/v1`.

## Planned route groups

```text
/api/v1/auth
/api/v1/users
/api/v1/organizations
/api/v1/creators
/api/v1/advertisers
/api/v1/campaigns
/api/v1/applications
/api/v1/content
/api/v1/reviews
/api/v1/verification
/api/v1/views
/api/v1/analytics
/api/v1/wallet
/api/v1/ledger
/api/v1/payments
/api/v1/payouts
/api/v1/notifications
/api/v1/admin
```

## Contract rules

- Add endpoints to OpenAPI first, then run `pnpm --filter @workspace/api-spec run codegen`.
- Every request body is a named entity-shaped schema.
- Use standard HTTP status codes and a stable error envelope with `code`, `message`, and `requestId`.
- Server derives ownership, identity, timestamps, and state transitions.
- List endpoints paginate and support search/filter/sort where required.
- Financial endpoints require idempotency keys.
- Never expose stack traces or secrets.

## Existing endpoint

`GET /api/healthz` is the current liveness endpoint and returns `{ "status": "ok" }`.