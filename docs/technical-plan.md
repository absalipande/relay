# Relay Technical Plan

Relay is moving to a TypeScript/Supabase stack.

## Active Stack

- Frontend: Next.js
- API: Fastify on Node.js
- Database: Supabase Postgres
- Auth: Supabase Auth
- Storage: Supabase Storage later
- Realtime: Supabase Realtime later
- Future services: Go microservices when there is a clear backend-heavy use case
- UI: Shadcn UI and TailwindCSS
- Validation: Zod
- Forms: React Hook Form
- Data fetching: TanStack Query or server actions, depending on screen needs
- Testing: Vitest for shared/API unit tests, Playwright for frontend flows

## Monorepo Layout

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

## Ownership Boundaries

### Next.js Frontend

- Dashboard UI
- Workspace/project/task screens
- Auth UI
- Form validation UX
- Client-side data fetching/caching
- AI assistant side panel UI

### Fastify API

- Product API routes
- Permission checks
- Request validation
- Business workflow orchestration
- AI assistant endpoints
- Webhook endpoints
- Server-side integration with Supabase service role where needed

### Supabase

- Auth users and sessions
- Postgres database
- Row-level security policies where useful
- Storage for avatars, project images, and task attachments
- Realtime events later

### Future Go Microservices

Go is no longer the main API stack, but it remains a good fit for specialized backend services when Relay needs them.

Good candidates:

- background jobs
- activity/event processing
- notification fanout
- file processing
- analytics aggregation
- import/export jobs
- AI context indexing
- webhook workers

Rules for introducing Go:

- Do not add a Go service until the Fastify/Supabase core is working.
- A Go service should own one focused job, not duplicate the Fastify product API.
- Communication should happen through queues, webhooks, Supabase tables, or internal HTTP endpoints.
- Supabase remains the primary database/auth platform.
- The archived Go backend can be used as reference, but future Go services should be scaffolded fresh under `services/`.

## MVP Build Order

- [x] Scaffold monorepo folders
- [x] Scaffold Next.js app in `apps/web`
- [x] Scaffold Fastify API in `apps/api`
- [x] Add shared TypeScript package in `packages/shared`
- [x] Add Supabase project config and migrations
- [ ] Implement auth UI with Supabase Auth
- [ ] Implement workspace tables and RLS/policies
- [ ] Implement Fastify workspace routes
- [ ] Implement projects
- [ ] Implement tasks
- [ ] Implement comments and activity logs
- [ ] Build dashboard, project board, task table, and settings screens
- [ ] Add focused Go microservice only after a clear async/backend-heavy need emerges

## AI Assistant Plan

Relay should keep the AI assistant panel from the product roadmap. In the TypeScript stack:

- Next.js owns the right-side assistant panel UI.
- Fastify owns model/provider calls and streaming responses.
- Supabase stores conversations, messages, context links, and saved outputs.
- Permission checks must happen before any workspace/project/task data is used as context.

## Current Status

The TypeScript scaffold is in place:

- `apps/web` has the Next.js app.
- `apps/api` has the Fastify API skeleton, health route, env validation, Supabase admin client boundary, and Vitest coverage.
- `packages/shared` has the initial shared TypeScript package.
- `supabase/migrations` has the first workspace/member migration.

The next planned implementation step is to wire Supabase locally and build the first auth/workspace flow.

## Migration Note

The existing Go code has been moved to `archive/go-backend` and should not be extended as the main API. Go may return later as fresh, focused microservices under `services/`.
