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
- UI: shadcn/ui, Radix primitives, Lucide icons, and TailwindCSS
- Validation: Zod
- Forms: React Hook Form
- Data fetching: TanStack Query or server actions, depending on screen needs
- Testing: Vitest for shared/API unit tests, Playwright for frontend flows

Product and visual direction is tracked in [docs/product-direction.md](product-direction.md).

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

Frontend code should use a feature-based structure:

- `app/` owns routes, route groups, layouts, loading states, and errors.
- `features/` owns product-domain UI and behavior such as auth, workspaces, projects, tasks, comments, and assistant.
- `components/` is reserved for shared UI primitives and cross-feature layout pieces.
- `lib/` owns infrastructure and framework adapters such as Supabase clients and env helpers.
- `hooks/` is reserved for generic hooks that are not tied to one feature.

Current frontend folders:

```txt
apps/web/
  app/
    (public)/
      page.tsx
    icon.svg
    layout.tsx
  components/
    ui/
      button.tsx
  features/
    auth/
      components/
        auth-form.tsx
        auth-hero.tsx
    workspaces/
      components/
        workspace-empty-state.tsx
  lib/
    query/
      query-provider.tsx
    supabase/
      client.ts
      server.ts
    utils.ts
  proxy.ts
```

Current auth UI:

- Split-screen sign-in/sign-up page under `app/(public)/page.tsx`.
- Left side uses a Relay-branded product-board illustration.
- Right side uses a compact white-background auth form.
- Email/password auth is wired to Supabase Auth.
- Auth form state uses React Hook Form with Zod validation.
- Google is the intended social provider, but OAuth setup is not wired yet.
- GitHub social login is intentionally omitted for MVP unless developer/team integrations become a near-term requirement.

Frontend state/data strategy:

- Use TanStack Query for server state, query caching, mutations, retries, optimistic updates, and invalidation.
- Organize query keys by feature domain, for example `features/workspaces/api/keys.ts`.
- Use React Hook Form for form state and Zod schemas for validation.
- Use URL search params for shareable view state such as filters and table views.
- Use local React state for small component-local UI toggles.
- Add Zustand only if shared client-only UI state emerges, such as command palette, selected task drawer, or persisted sidebar state.
- Do not add tRPC yet. Keep the frontend/backend contract as Fastify HTTP routes validated with Zod, sharing schemas through `packages/shared` when useful.

UI component strategy:

- Use shadcn/ui for shared primitives under `components/ui`.
- Current shadcn setup uses `components.json` with the `radix-nova` style and Lucide icon library.
- Use `cn` from `lib/utils.ts` for conditional class merging.
- Use Relay blue `#007AFF` as the primary action/icon color and `#312ECB` only as secondary emphasis.
- Use a white-first app surface with zinc/neutral hover, active, border, and selected states.
- Prefer the Veyra-inspired app shell rhythm: fixed app height, wide max width, compact typography, internal content scrolling, and a white-first surface.
- Use the Jira mock as the sidebar/navbar structure reference: logo row with collapse affordance, workspace card, grouped nav, quick-create card, account dropdown, breadcrumb, search, and notification badge.
- The right context panel is dynamic. Do not render an empty persistent AI panel by default; render details/AI tabs only after the user selects contextual data.
- Feature pages, including auth, should use shadcn primitives such as `Button`, `Input`, `Label`, and `Tabs` instead of raw native controls when an appropriate primitive exists.
- Keep feature-specific composed UI inside each `features/*/components` folder.
- Add shadcn components on demand instead of preloading a large component set.

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
- [x] Link Supabase project and configure local API/web env files
- [x] Apply initial Supabase migration to the linked project
- [x] Add initial workspace/member RLS policies
- [ ] Baseline Supabase CLI migration history before future `db push`
- [x] Install Supabase web packages and client/server helpers
- [x] Implement basic auth UI with Supabase Auth
- [x] Add Relay logo, tab icon, and polished split-screen auth page
- [x] Add TanStack Query provider
- [x] Add React Hook Form and Zod validation pattern
- [x] Install and initialize shadcn/ui
- [ ] Wire Google OAuth provider in Supabase
- [ ] Implement workspace tables and membership flows
- [ ] Implement Fastify workspace routes
- [ ] Implement projects
- [ ] Implement tasks
- [ ] Implement comments and activity logs
- [x] Build contained workspace shell with sidebar, navbar, and dynamic right context panel scaffold
- [ ] Build project board, task table, full context panel details, and settings screens
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
- `supabase/config.toml` links the remote Supabase project.
- Local untracked API/web env files are configured with the Supabase URL, publishable key, service role key, and database URL.
- The initial workspace/member migration has been applied to the remote Supabase database with `psql`.
- Remote verification confirmed the workspace/member tables have nine RLS policies.
- `apps/web` has a feature-based frontend structure, Supabase browser/server clients, session refresh proxy, Relay logo assets, a polished split-screen sign-in/sign-up page, and a Veyra/Jira-inspired app shell under `/app`.

The next planned implementation step is to create the first signed-in workspace flow, then baseline Supabase CLI migration history before future migration pushes.

## Migration Note

The existing Go code has been moved to `archive/go-backend` and should not be extended as the main API. Go may return later as fresh, focused microservices under `services/`.
