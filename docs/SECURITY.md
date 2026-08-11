# AdPerform — Security Baseline

## Required controls

- Secure, HttpOnly, SameSite cookies or short-lived access tokens with refresh rotation.
- Password hashing, email/phone verification, OTP rate limits, brute-force protection, and device session management.
- RBAC plus permission checks on the server; UI visibility is not authorization.
- Request validation with generated Zod schemas and output sanitization.
- CSRF protection for cookie-authenticated state changes.
- Security headers: CSP, HSTS in production, X-Content-Type-Options, Referrer-Policy, and frame protection.
- Separate upload authorization from object storage; use presigned URLs.
- Audit actor, action, entity, before/after, timestamp, IP/device, and reason for sensitive changes.
- Idempotency for payments, webhooks, payouts, wallet mutations, and settlement.
- Fraud findings require evidence, review state, and dispute path before financial action.

## Secret handling

Secrets are environment-managed. Keep `SESSION_SECRET`, database URLs, payment credentials, social tokens, and AI keys out of source control and logs. Do not print secret values while debugging.