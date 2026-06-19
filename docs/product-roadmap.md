# Relay Product Roadmap

This roadmap tracks product features beyond the backend implementation checklist.

## Product Name

The product name is Relay. Any older planning references to Worklane should be read as Relay.

## Product Direction

Relay should feel like the useful center of Jira and ClickUp: structured enough for serious project tracking, flexible enough for small teams, and calmer than both. The differentiator is a fullscreen context-first shell: a full main sidebar by default, a persistent icon rail plus dynamic secondary sidebar after choosing a destination, and eventually a dynamic right panel that starts as an inspector before becoming an AI assistant.

The detailed product and visual direction is tracked in [docs/product-direction.md](docs/product-direction.md).
The Jira clone reference is the base/core feature blueprint. Relay should recreate its main flows first, then improve them with Relay's stack, calmer UI, stronger permissions, comments/activity history, and later AI context.

## MVP Core

- [x] Supabase project created and connected locally
- [x] Initial workspace/member database migration applied
- [x] Initial workspace/member RLS policies applied
- [x] Basic authentication with Supabase Auth
- [x] Polished sign-in/sign-up page
- [x] Email verification holding page after sign-up
- [x] Frontend server-state/form stack selected
- [x] shadcn/ui initialized for reusable UI primitives
- [ ] Google OAuth login
- [x] First-workspace setup route for new accounts
- [x] Workspaces and workspace members
- [ ] Workspace roles and permissions
- [x] Projects inside workspaces
- [ ] Project members and project roles
- [x] Tasks with status, priority, assignee, and due date
- [x] Task checklist items
- [ ] Comments
- [ ] Activity logs
- [x] Kanban board scaffold
- [ ] Durable Kanban ordering and drag updates
- [ ] Task table view
- [ ] Calendar view
- [x] Fullscreen workspace shell with default main sidebar, focused rail navigation, dynamic secondary sidebar, navbar, centered main canvas, and account/search surfaces
- [x] Sidebar-level Projects page
- [x] Persistent rail and dynamic secondary sidebar scaffold
- [x] Secondary sidebar behavior and page feature contracts documented
- [ ] Dynamic right panel scaffold
- [ ] Basic workspace/project settings
- [x] Project details page with project-scoped modal task creation and task views
- [x] Task details page with checklist editing and status controls
- [x] Members page scaffold for invite and role management
- [x] Workspace settings scaffold for identity, permissions, and lifecycle controls
- [ ] Real project/task inspector content in the right panel
- [ ] Close/reopen and selected-context behavior for right panel across project/task surfaces

## Version 1 Polish

- [ ] Invite system with pending invites and accept flow
- [ ] Advanced task/project search
- [ ] Saved filters
- [ ] Calendar view
- [ ] Image/file uploads
- [ ] Workspace overview dashboard
- [ ] Project analytics
- [ ] Responsive UI polish
- [ ] Focused shell polish for project/task views
- [ ] Right-panel resize/persisted width

## Near-Term Product Direction

The workspace overview should stay a compact summary surface. It can show KPI
tiles, project summaries, task status, recent activity, and deadlines, but it
should not host full creation workflows beyond lightweight workspace-level
actions such as creating a project.

Next work should move deeper workflows into dedicated product surfaces:

1. Sidebar destination polish: Home, Projects, Tasks, Members, and Settings
   should each land on a useful route-level surface inside the new rail +
   secondary-sidebar shell, following the documented split between route/view
   items and scroll-synced "On this page" anchors.
2. Focused shell layer: refine rail interactions, main-sidebar reopen behavior,
   secondary sidebar sections, centered work canvas, and closable right
   inspector as one coherent system.
3. Reference-style task views: table, Kanban, and calendar tabs, with task
   creation in a modal rather than exposed inline forms.
4. Real inspector details: project summary, task details, status, priority,
   assignee, due date, checklist, comments, and activity should appear in the
   right panel where useful.
5. Members and invites: member list, invite code, role changes, and removal
   confirmation.
6. Workspace/project settings: rename, archive/delete, and role-gated controls.
7. Task details: title, description, status, priority, due date, checklist
   editing, comments, and activity.
8. Workspace overview polish: compact, mostly borderless sections that blend
   with the white app shell and avoid unnecessary scrolling.

## AI Assistant Panel

Relay should eventually include a right-side AI assistant panel inside the dynamic inspector: a contextual chat panel that can reason over selected workspace/project/task content and generate useful artifacts.

### Core Use Cases

- [ ] Summarize a project, task thread, or recent activity
- [ ] Turn rough notes/comments into tasks or a day-by-day plan
- [ ] Answer questions about selected project context
- [ ] Draft project updates, release notes, standup summaries, and stakeholder briefs
- [ ] Generate action items from comments or activity logs
- [ ] Save AI output as a task, comment, project note, or workspace note
- [ ] Copy AI output to clipboard
- [ ] Attach files or selected records as context

### UX Direction

- [ ] Right-side resizable assistant panel
- [ ] Details/Ask AI tab model inside the dynamic right panel
- [ ] Context chips for selected project/task/files
- [ ] Prompt input pinned to the bottom
- [ ] Response area with save/copy actions
- [ ] Clear chat action
- [ ] Empty state with suggested prompts
- [ ] Per-workspace assistant history

### Backend Needs

- [ ] AI conversation tables
- [ ] AI message tables
- [ ] Context reference tables for linked tasks/projects/files
- [ ] Permission checks before content is used as AI context
- [ ] Provider abstraction for model calls
- [ ] Streaming response endpoint
- [ ] Audit/activity log entries for AI-created artifacts

### Suggested Phase

This should come after the task/comment/activity-log core exists. The first practical version can be read-only plus copy/save actions:

1. Summarize selected project/task context.
2. Generate action items.
3. Save output as comment or task draft.
4. Add file context later when uploads exist.

## Later Advanced Features

- [ ] Additional OAuth/social login beyond Google
- [ ] Custom roles
- [ ] Custom workflows
- [ ] Sprints
- [ ] Notifications
- [ ] Email reminders
- [ ] Realtime collaboration
- [ ] Automations
