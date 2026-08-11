# AdPerform — Deployment Notes

## Replit development

Managed workflows provide the correct `PORT` and `BASE_PATH`:

- `artifacts/adperform: web`
- `artifacts/api-server: API Server`
- `artifacts/mockup-sandbox: Component Preview Server`

Use the workspace proxy paths in application code (`/` for web and `/api` for API). Do not hardcode localhost ports in the app.

## Production shape

```text
Load Balancer → CDN → Web artifact
             → API instances → PostgreSQL / Redis / Queue / Object Storage
                              → workers / analytics
```

Before production launch, configure managed secrets, database migrations, object storage, rate limits, structured logs, health/readiness checks, backups, and monitoring.

## Quality gate

Run:

```bash
pnpm run typecheck
pnpm run build
```

Then verify the core advertiser and creator journeys in a browser before publishing.