# Relay Product Roadmap

This roadmap tracks product features beyond the backend implementation checklist.

## Product Name

The product name is Relay. Any older planning references to Worklane should be read as Relay.

## Product Direction

Relay should feel like the useful center of Jira and ClickUp: structured enough for serious project tracking, flexible enough for small teams, and calmer than both. The differentiator is a persistent contextual right panel that starts as an inspector for selected projects/tasks and later becomes an AI assistant that can summarize, draft, and extract next actions from workspace context.

The detailed product and visual direction is tracked in [docs/product-direction.md](docs/product-direction.md).

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
- [ ] Kanban board
- [ ] Task table view
- [x] Contained workspace shell with sidebar, navbar, main canvas, and dynamic right context panel scaffold
- [ ] Basic workspace/project settings
- [ ] Project details page with project-scoped task creation and task list
- [ ] Task details page/panel with checklist editing and status controls

## Version 1 Polish

- [ ] Invite system with pending invites and accept flow
- [ ] Advanced task/project search
- [ ] Saved filters
- [ ] Calendar view
- [ ] Image/file uploads
- [ ] Workspace overview dashboard
- [ ] Project analytics
- [ ] Responsive UI polish

## Near-Term Product Direction

The workspace overview should stay a compact summary surface. It can show KPI
tiles, project summaries, task status, recent activity, and deadlines, but it
should not host full creation workflows beyond lightweight workspace-level
actions such as creating a project.

Next work should move deeper workflows into dedicated product surfaces:

1. Project details page: project header, description, status, task creation,
   project task list, and eventually board/table tabs.
2. Task details page or context panel: title, description, status, priority,
   due date, checklist editing, comments, and activity.
3. Workspace overview polish: compact, mostly borderless sections that blend
   with the white app shell and avoid unnecessary scrolling.

## AI Assistant Panel

Relay should eventually include a right-side AI assistant panel similar to the reference UI: a contextual chat panel that can reason over selected workspace/project/task content and generate useful artifacts.

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
