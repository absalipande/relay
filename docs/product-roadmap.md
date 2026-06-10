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
- [x] Frontend server-state/form stack selected
- [x] shadcn/ui initialized for reusable UI primitives
- [ ] Google OAuth login
- [ ] Workspaces and workspace members
- [ ] Workspace roles and permissions
- [ ] Projects inside workspaces
- [ ] Project members and project roles
- [ ] Tasks with status, priority, assignee, and due date
- [ ] Comments
- [ ] Activity logs
- [ ] Kanban board
- [ ] Task table view
- [x] Contained workspace shell with sidebar, navbar, main canvas, and dynamic right context panel scaffold
- [ ] Basic workspace/project settings

## Version 1 Polish

- [ ] Invite system with pending invites and accept flow
- [ ] Advanced task/project search
- [ ] Saved filters
- [ ] Calendar view
- [ ] Image/file uploads
- [ ] Workspace overview dashboard
- [ ] Project analytics
- [ ] Responsive UI polish

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
