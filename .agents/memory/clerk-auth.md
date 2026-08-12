---
name: Clerk auth and artifact paths
description: Durable constraints for Clerk integration in this workspace's path-based web artifact.
---

The web artifact uses a path-based deployment. Clerk paths, logo URLs, and sign-in/sign-up routes must include the artifact base path, while Wouter routes remain base-relative.

**Why:** Clerk reads `window.location.pathname` directly and OAuth callback routes fail when the base prefix is omitted. The same build must work in development and production, where the Clerk proxy value is intentionally empty in development.

**How to apply:** Derive `basePath` from `import.meta.env.BASE_URL`, use `publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)`, pass `proxyUrl={import.meta.env.VITE_CLERK_PROXY_URL}`, and keep the exact Wouter paths `/sign-in/*?` and `/sign-up/*?`.