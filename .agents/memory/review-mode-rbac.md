---
name: Review mode RBAC
description: Durable product rule for human versus AI review in AdPerform.
---

Human review is the default. Switching the platform to AI review is a privileged platform setting for Admin and Super Admin only; the server must enforce this independently of UI state and record every change in the immutable audit log.

**Why:** Review decisions affect brand trust and downstream financial operations, so hiding a control in the UI is not sufficient authorization.

**How to apply:** Keep the fallback mode as `human`, gate read/write settings routes with the role middleware, pause human decisions when AI mode is enabled, and never let an AI reviewer mutate balances or make a final financial decision directly.