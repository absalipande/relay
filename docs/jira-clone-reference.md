# Jira Clone Reference Notes

The file `/Users/absalipande/Downloads/nextjs-jira-clone-master.zip` is a useful product and flow reference for Relay, but it should not become the technical source of truth. Relay stays on the current Next.js, Fastify, Supabase Postgres/Auth, shadcn/ui, TanStack Query, Zod, and React Hook Form stack described in [technical-plan.md](technical-plan.md).

## Product Strategy

Relay is a Jira and ClickUp lite product: structured enough for real project tracking, lighter and calmer than both, and eventually differentiated by contextual intelligence. Use the Jira clone as Relay's base product skeleton, then implement the same core flows with Relay's own stack, calmer interface, stronger permissions, and later AI-native context features.

The reference is strongest as a feature map:

- Authentication
- Workspace dashboard and workspace switching
- Sidebar project list with project creation
- Project detail pages
- Task list, table, board, and calendar views
- Task detail pages or panels
- Members, roles, invites, and join flow
- Workspace and project settings
- Analytics cards and status summaries

Relay should reach reference parity first, but it should not stop there. The Relay version should improve the reference in these ways:

- Use Supabase Auth, Postgres, RLS, and Fastify route-level permission checks instead of Appwrite documents and sessions.
- Make task details and project details feel first-class, with a right-side context panel available for selected records.
- Add comments and activity logs earlier because they become useful project memory and later AI context.
- Build board interactions with durable task ordering, optimistic updates, and clear status transitions.
- Keep the UI compact, quiet, and work-focused instead of copying the reference's styling exactly.
- Add the AI assistant only after projects, tasks, comments, and activity logs provide enough context to make it useful.

The working rule: copy the flow, not the implementation. Match the reference's product coverage where it helps users understand the app, then make Relay better through architecture, UX polish, and contextual intelligence.

## Reference Parity Then Relay Upgrades

Reference parity means Relay should support the core loops a user expects from the Jira clone before we over-invest in unique features:

- Workspace home and workspace switching
- Sidebar links: Home, My Tasks, Settings, Members, and project list
- Project pages with task views as the main work surface
- Task creation through modals, not exposed forms that dominate the page
- Task table, Kanban, and calendar tabs
- Task detail pages or panels with status, priority, due date, checklist, comments, and activity
- Workspace members, invites, role updates, and removal flow
- Workspace and project settings
- Compact analytics/status summaries

Relay upgrades come after or alongside parity where they do not slow the core loop:

- Better permission boundaries through Supabase RLS plus Fastify checks
- Quieter UI density than Jira or ClickUp
- Task/project context panels only when useful, never permanently empty
- Comments and activity logs as project memory
- AI assistant features after the underlying work history exists

## What To Borrow

- Feature flow: signed-in dashboard, workspace selection, workspace creation, workspace settings, invite/join flow, member management, project settings, project details, task details, and task creation from contextual surfaces.
- Information architecture: route groups for auth/dashboard/standalone flows, feature folders by domain, small feature-owned API/client hooks, and separate reusable UI primitives.
- Task surfaces: table, Kanban, and calendar views behind tabs with shareable URL filters for status, assignee, project, and due date.
- Kanban behavior: status columns, ordered tasks, and bulk status/position updates after drag-and-drop.
- Workspace operations: generated invite codes, reset invite code, member roles, admin-only settings, and protected member removal/role updates.
- Analytics direction: compact cards for task/project counts and status movement. These can become workspace and project overview sections after core task views exist.
- Detail navigation: breadcrumbs for task/project pages, compact overview properties, and actions menus for edit/delete/archive flows.

## What To Adapt

- Backend routes should be implemented in `apps/api` Fastify routes, not Hono route handlers inside Next.js.
- Auth and persistence should use Supabase Auth and Postgres RLS, not Appwrite users, sessions, storage, or document collections.
- File/image support should use Supabase Storage later. For now, keep avatar/project image fields optional and avoid blocking core task flows on uploads.
- Client data should use Relay's current split: server actions where the screen is simple, TanStack Query for interactive list/detail surfaces, filters, optimistic mutations, and drag updates.
- Validation should stay with Zod. Shared request/response schemas can move into `packages/shared` when API/frontend duplication becomes meaningful.
- UI should follow Relay's calmer app-shell direction: compact, white-first, restrained color, Lucide icons, shadcn primitives, and no wholesale copy of the reference's card-heavy settings screens.

## Avoid Copying

- Appwrite-specific data model assumptions such as `$id`, `$createdAt`, document collections, and SDK query shapes.
- Hono middleware and route composition. Similar authorization ideas belong in Fastify plugins and per-route preHandlers.
- Next 14 or React 18 constraints from the reference when Relay's installed versions differ.
- Reference UI styling verbatim. Treat layout and flow as inspiration, not as a design system.
- Mandatory image upload in create/edit forms until Relay has a storage and image-cropping story.

## Suggested Build Order From The Reference

- [x] Project details page: route, header, project metadata, project-scoped task creation, and task list filtered by project.
- [x] Project-scoped task creation: create tasks from the project page without requiring users to pick a project.
- [x] Task detail surface: dedicated page or right context panel with status, priority, due date, checklist editing, description, and actions.
- [x] Task view switcher: tabs for list/table first, then Kanban, then calendar.
- [x] URL filters: status, project, assignee, due date, and later saved filters.
- [ ] Workspace members and invites: invite code generation/reset, join route, member list, admin role updates, and removal confirmation.
- [ ] Settings screens: workspace settings and project settings with rename/archive/delete controls.
- [ ] Analytics cards: workspace/project rollups after task lifecycle data is stable.

## Current Fit With Relay

Relay already has workspaces, members, projects, tasks, checklist items, the app shell, and basic create/archive/status flows. The largest useful next step from the reference is not another overview form. It is a deeper project route where task creation and task review happen in project context, followed by a task detail/context panel that makes checklist and status updates feel first-class.
