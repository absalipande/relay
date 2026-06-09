# Relay

Relay is a lightweight ClickUp/Jira-style project tracker for small teams, built as a modern full-stack TypeScript app with a clean SaaS-style architecture.

## Planned stack

- Next.js frontend
- Fastify Node.js API
- Supabase Postgres
- Supabase Auth
- Supabase Storage later
- SQL migrations through Supabase
- Shadcn UI and TailwindCSS
- Go microservices later for focused backend-heavy jobs

## Stack Decision

Relay is moving from the earlier Go backend prototype to a TypeScript/Supabase stack:

- `apps/web` will contain the Next.js app.
- `apps/api` will contain the Fastify API.
- Supabase will own auth, Postgres, storage, and realtime primitives.
- Fastify will own product-specific API orchestration, permissions, validation, webhooks, and AI endpoints.

The previous Go backend is archived in [archive/go-backend](archive/go-backend).

## Monorepo Shape

```txt
relay/
  archive/
    go-backend/
  apps/
    web/
    api/
  services/
    go-worker/
  packages/
    shared/
  supabase/
    migrations/
  docs/
```

## Run locally

The new TypeScript stack has not been scaffolded yet. Once it is, local setup will use Node.js package scripts plus Supabase local/dev configuration.

## Progress

Product feature planning is tracked in [docs/product-roadmap.md](docs/product-roadmap.md).

The active technical direction is tracked in [docs/technical-plan.md](docs/technical-plan.md).

The old Go backend checklist is preserved in [archive/go-backend/docs/backend-checklist.md](archive/go-backend/docs/backend-checklist.md).
