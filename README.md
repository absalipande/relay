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

The TypeScript stack is scaffolded, Supabase is connected, and the first auth
screen is in place. Product flows are still early.

Frontend:

```sh
cd apps/web
npm run dev
```

API:

```sh
cd apps/api
npm run dev
```

Environment files are intentionally untracked. Configure local `.env` files from
your Supabase dashboard values instead of committing examples.

Supabase:

```sh
supabase login
supabase link --project-ref ohpfhplapyplckemchul
```

The Supabase project is linked in `supabase/config.toml`. Local API and web env
files are configured on this machine but are intentionally ignored by git.

Current frontend structure:

```txt
apps/web/
  app/
    (public)/
      page.tsx
      verify-email/
        page.tsx
    app/
      page.tsx
      workspaces/
        new/
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

`app/` owns routes and layouts, `features/` owns product-domain UI, and `lib/`
owns framework/infrastructure adapters such as Supabase clients. Shared UI
primitives live in `components/ui` and are generated through shadcn/ui.

Frontend state and forms:

- TanStack Query owns server state, caching, and invalidation.
- React Hook Form owns form state.
- Zod owns client-side validation schemas.
- shadcn/ui owns reusable UI primitives, using the Radix Nova preset and Lucide icons.
- App and feature pages should prefer shadcn primitives from `components/ui`
  instead of raw native controls when a matching component exists.
- Local React state is reserved for small UI state such as password visibility.
- Zustand is intentionally deferred until shared client-only UI state appears.

Useful API checks:

```sh
cd apps/api
npm test
npm run build
```

Supabase migrations live under `supabase/migrations`. The first workspace/member
migration has been applied directly to the linked Supabase project and verified.
Because it was applied with `psql`, the Supabase CLI migration history still
needs to be baselined before using future `supabase db push` workflows.

The current auth page uses Supabase email/password sign-in and sign-up. New
sign-ups are sent to `/verify-email` with the submitted email in the query
string while Supabase sends the confirmation email. After the user confirms
their email, Supabase redirects them back to the public sign-in page. Once a
signed-in user reaches `/app`, users without any workspaces are redirected to
`/app/workspaces/new` to create their first workspace. Google OAuth is shown as
the intended social provider, but OAuth provider setup is not wired yet.

## Progress

Product feature planning is tracked in [docs/product-roadmap.md](docs/product-roadmap.md).

The active technical direction is tracked in [docs/technical-plan.md](docs/technical-plan.md).

The old Go backend checklist is preserved in [archive/go-backend/docs/backend-checklist.md](archive/go-backend/docs/backend-checklist.md).
