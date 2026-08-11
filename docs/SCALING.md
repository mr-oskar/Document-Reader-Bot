# AdPerform — Scaling Roadmap

## Phase 1 — MVP

Modular monolith, PostgreSQL, Redis, object storage, queue, CDN, manual review, and basic analytics.

## Phase 2 — Growth

Multiple API instances, load balancing, worker autoscaling, read replicas, cursor pagination, caching, and batched realtime updates.

## Phase 3 — Analytics

Event streaming, dedicated analytics workers, ClickHouse or equivalent, pre-aggregated daily metrics, and retention policies for raw events.

## Phase 4 — Large scale

Kubernetes/HPA, multi-AZ data services, isolated payment/verification/analytics workers, and extraction of bounded contexts that have independent scaling needs.

Do not introduce dozens of microservices before operational boundaries and traffic justify them.