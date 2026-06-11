# Relay Product Direction

Relay is a calm project workspace for small teams. It should feel like the useful center of Jira and ClickUp, but quieter, faster to understand, and designed around contextual help instead of configuration sprawl.

## Product Position

Relay should combine:

- Jira's backbone: workspaces, projects, tasks, statuses, comments, activity, permissions, and eventually boards/sprints.
- ClickUp's flexibility: multiple task views, quick create, personal task focus, lightweight workspace dashboards, and practical filters.
- A Relay-specific contextual panel: a right-side inspector and assistant that understands the selected workspace, project, or task.

The goal is not to out-feature Jira or ClickUp. The goal is to make the common project-tracking loop feel calm:

1. See what matters.
2. Open the relevant project or task.
3. Understand context quickly.
4. Update work without losing your place.
5. Ask the assistant to summarize, draft, or extract next actions when helpful.

## Layout Direction

Relay should use a calm workspace shell inspired by the Veyra app layout and the old `jira-go-*` mocks. The current direction is white-first, compact, and OS-like: persistent sidebar, top navigation, main work canvas, and an optional right context panel.

```txt
white app surface
┌ sidebar ┐ ┌──────────── main workspace canvas ────────────┐ ┌ optional context panel ┐
│ nav     │ │ top navbar + projects, board, list, table      │ │ selected details / AI  │
└─────────┘ └────────────────────────────────────────────────┘ └────────────────────────┘
```

Desktop guidance:

- Use the Veyra shell rhythm: fixed app height, wide centered max width, compact typography, and internal scrolling.
- Keep the app surface white (`#fff`) rather than using a heavy framed dashboard background.
- Avoid edge-to-edge enterprise dashboard density.
- Keep the left sidebar persistent on desktop.
- Do not show the right context panel by default. It appears only when the user selects a project, task, workspace, member, or another contextual object.
- Main content should remain broad enough for real work; the panel should not make the canvas feel cramped.
- Use URL or local state to represent selected context, depending on whether the selection should be shareable.

Mobile guidance:

- Sidebar collapses behind navigation.
- Context panel becomes a drawer or route-level detail view.
- Core task creation and task update flows must remain usable before advanced dashboard views are optimized.

## Visual Direction

Relay should look calm, white, and precise.

Core colors:

- Primary blue: `#007AFF`, matching the Relay SVG.
- Secondary blue: `#312ECB`, used sparingly for depth, gradients, or special emphasis.
- Background: white-first. Use very soft blue-gray only outside the app shell or for quiet framing.
- Neutral states: zinc/neutral grays for hover, active, selected, borders, dividers, and secondary surfaces.
- Destructive/error: restrained red only for real warnings or overdue/blocked states.
- Success: restrained green only for completion/healthy status.
- Warning: restrained amber/orange only for risk or upcoming deadline states.

Interaction states:

- Active navigation should use a very soft blue-tinted surface with a blue icon and label.
- Hover states should use neutral/zinc, not tinted purple.
- Primary actions should use `#007AFF`.
- Icons in navigation and major feature controls should use the theme blue when active or important.
- Avoid large purple surfaces and purple-heavy gradients from the old Worklane mockups.

Shape and density:

- Cards and panels should use modest radius, around `8px`.
- Avoid nested card stacks.
- Keep dashboards dense enough to scan but not visually loud.
- Prefer crisp table/list rows, selected states, and right-side detail panels over oversized marketing-style cards.

## Feature Shape

Relay's MVP should move toward these primary screens:

1. Workspace shell
   - Workspace switcher
   - Sidebar navigation
   - Quick create
   - User/account footer with dropdown menu before sign out
   - Top navbar with breadcrumb, search, and notifications

2. Projects
   - Project list/grid
   - Status/health
   - Progress and task counts
   - Create project

3. Project work view
   - Board view first
   - List/table view soon after
   - Group by status initially

4. Tasks
   - Task list
   - Task detail panel
   - Status, priority, assignee, due date
   - Checklist
   - Comments
   - Activity timeline

5. Team and permissions
   - Member list
   - Workspace roles
   - Invite flow later
   - Right-side member inspector

6. Context panel / assistant
   - Starts as a selected task/project inspector.
   - Evolves into an assistant panel after the task/comment/activity core exists.

## Context Panel Direction

The right panel is a signature Relay surface, but it should be dynamic rather than permanently visible.

Before AI:

- Show selected task details.
- Show project summary.
- Show selected workspace/member details when relevant.
- Show comments and activity.
- Show checklist and metadata.
- Let users update important fields without leaving the current view.
- Include tabs or segmented controls to switch between details and AI for the selected object.

With AI:

- Summarize selected project or task context.
- Draft status updates.
- Generate action items from comments/activity.
- Turn notes into tasks.
- Copy output or save it back as a comment/task/project note.

The assistant should feel like the system thinking alongside the user, not like a separate chatbot bolted onto the product.

## Old Mockup Notes

The `apps/web/public/jira-go-*` images are useful references for structure, not final styling.

Keep:

- Sidebar/workspace switcher pattern.
- Project cards and project health ideas.
- Board/list task views.
- Task detail panel with checklist, comments, and activity.
- Team table with right-side member inspector.
- Quick create.
- Top navbar breadcrumb, search, divider, and notification badge pattern.

Change:

- Replace purple-heavy styling with Relay blue and neutral states.
- Use the Veyra shell/typography rhythm rather than a heavy full-screen dashboard card.
- Make the right-side panel a dynamic product primitive, not a permanently visible empty assistant.
- Reduce generic SaaS dashboard polish in favor of a quieter work surface.

## Current Shell Decisions

The current `/app` shell uses:

- Veyra-inspired app sizing: fixed app height, wide max width, compact typography, and a thin internal scrollbar.
- Jira-inspired sidebar structure: logo row with collapse affordance, workspace card, grouped nav, quick-create card, and user account card.
- Navbar pattern from the Jira mock: desktop breadcrumb on the left, search on the right, a subtle divider, and a notification icon with badge.
- Sidebar active state is page-driven. Overview is highlighted only on the
  actual `/app` overview page, not on setup routes such as
  `/app/workspaces/new`.
- Account behavior: the sidebar account chevron opens a dropdown; sign out must not happen from a single accidental chevron click.
- Dynamic context: the right panel appears only when something is selected. The first scaffold uses workspace URL params and a Details/AI tab.
