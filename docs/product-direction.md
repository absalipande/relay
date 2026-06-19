# Relay Product Direction

Relay is a calm project workspace for small teams. It should feel like the useful center of Jira and ClickUp, but quieter, faster to understand, and designed around contextual help instead of configuration sprawl.

## Product Thesis

Relay is a Jira and ClickUp lite product with a fullscreen, context-first workspace shell. It should recreate the core project-management loop from the Jira clone reference first, then improve that loop with Relay's own interface, architecture, and contextual intelligence.

Use the Jira clone reference as a feature and flow blueprint, not as an implementation blueprint:

- Copy the product coverage: workspaces, projects, tasks, task views, task details, members, invites, settings, and analytics.
- Keep Relay's stack: Next.js, Fastify, Supabase Auth/Postgres/RLS, shadcn/ui, Zod, and TanStack Query/server actions.
- Keep Relay's UX direction: calmer than Jira and ClickUp, less configuration-heavy, compact, white-first, and context-aware.
- Use Relay's own shell model: fullscreen app surface, persistent main icon rail, reopenable main sidebar, dynamic secondary sidebar, and a dynamic right inspector.
- Avoid exposing large create forms on primary work surfaces when the reference uses modals.
- Add Relay-specific context panels and AI only after the core task/comment/activity loop is strong.

## Product Position

Relay should combine:

- Jira's backbone: workspaces, projects, tasks, statuses, comments, activity, permissions, and eventually boards/sprints.
- ClickUp's flexibility: multiple task views, quick create, personal task focus, lightweight workspace dashboards, and practical filters.
- A Relay-specific contextual system: project/task focused navigation plus a right-side inspector and assistant that understands the selected workspace, project, or task.

The goal is not to out-feature Jira or ClickUp. The goal is to make the common project-tracking loop feel calm:

1. See what matters.
2. Open the relevant project or task.
3. Understand context quickly.
4. Update work without losing your place.
5. Ask the assistant to summarize, draft, or extract next actions when helpful.

## Layout Direction

Relay should use a calm fullscreen workspace shell inspired by the reference video layout, Discord's focused navigation model, the Veyra app rhythm, and the old `jira-go-*` mocks. The current direction is white-first, compact, OS-like, and context-aware: a full main sidebar by default, a persistent icon rail in focused mode, a dynamic secondary sidebar after choosing a destination, a main work canvas, and an optional right context panel.

```txt
fullscreen white app surface
default
┌ full main sidebar ┐ ┌──────────── centered main workspace canvas ────────────┐
│ logo + destinations│ │ top navbar + overview/projects/tasks/settings         │
└───────────────────┘ └───────────────────────────────────────────────────────┘

focused project/task mode
┌ rail ┐ ┌ secondary sidebar ┐ ┌──── centered work canvas ────┐ ┌ dynamic right panel ┐
│ icons│ │ selected section  │ │ board/list/table/detail flow │ │ details / Ask AI     │
└──────┘ └───────────────────┘ └──────────────────────────────┘ └─────────────────────┘
```

Desktop guidance:

- Use a fullscreen white app surface rather than a boxed dashboard frame.
- Main content should be centered and intentionally constrained, not stretched edge-to-edge.
- Use slightly larger, readable typography than the previous zoomed production frame while staying compact.
- Keep the app surface white (`#fff`) rather than using a heavy framed dashboard background.
- Avoid edge-to-edge enterprise dashboard density.
- Show one full main sidebar by default: Relay logo, workspace action, Home, Projects, Tasks, Members, Settings, project shortcuts, and account footer.
- When a user clicks a main destination, collapse the main sidebar into the persistent icon rail and open the dynamic secondary sidebar for that selected area.
- The Relay logo in the rail reopens the full main sidebar.
- The secondary sidebar is collapsible/reopenable and changes by active area: Home, Projects, Tasks, Members, or Settings.
- Collapsing the secondary sidebar leaves the rail visible so the main content gets more focus.
- Do not show the right context panel by default. It appears only when the user selects a project, task, workspace, member, or another contextual object, or when the route itself is a detail context.
- The right panel must be closable. Closing it should return space to the main canvas without leaving the current route.
- Main content should remain broad enough for real work; the panel should compress the canvas gracefully without making it feel cramped.
- Use URL or local state to represent selected context, depending on whether the selection should be shareable.

Mobile guidance:

- Sidebar collapses behind navigation.
- Context panel becomes a drawer or route-level detail view.
- Core task creation and task update flows must remain usable before advanced dashboard views are optimized.

## Secondary Sidebar Model

The secondary sidebar should be a contextual navigation surface, not a loose dumping ground. It can scroll when content grows, but its sections should have predictable behavior.

Use a hybrid model:

- Destination/view items live at the top and represent route, query, or persisted view state. Their active state changes only when the route or active view changes.
- Page-section items live below them and behave like an "on this page" table of contents. Their active state may update as the main canvas scrolls.
- Visually separate these behaviors with section labels such as `Views`, `Filters`, `Project spaces`, `Management`, and `On this page`.
- Do not mix route-changing items and scroll-synced anchors in one unlabelled list.
- Clicking a route/view item may update the URL, query string, selected view, or selected saved filter.
- Clicking an "On this page" item scrolls the main canvas to that section without implying a route change.
- Scroll-sync highlighting should only be used for sections that actually exist in the current main canvas.
- If a page does not yet have meaningful long-form sections, omit the "On this page" group rather than showing placeholder anchors.

This keeps the dynamic sidebar elegant without making active highlights feel magical or unstable.

```txt
Tasks secondary sidebar

Views
  All tasks
  My tasks
  Due soon
  Blocked

Layouts
  Table
  Board
  Calendar

On this page
  Overview
  Priority
  Status
  Recent activity
```

The rule of thumb: main sidebar chooses the product area, secondary sidebar chooses the area-specific view or local section, and the right panel shows selected object context.

## Page Feature Contracts

The following contracts define what each main destination is responsible for. They should guide secondary sidebar content before implementation details are finalized.

### Home

Purpose: give the user a calm workspace command center.

Primary jobs:

- Show the selected workspace's current state.
- Surface urgent or due-soon work.
- Show assigned work and recent activity.
- Point users toward projects that need attention.
- Offer lightweight workspace-level actions such as creating a project.

Secondary sidebar groups:

- `Overview`: Dashboard, Activity, Assigned to me, Due soon, Workspace health.
- `On this page`: Summary, Active projects, My work, Upcoming deadlines, Recent activity, Health signals.

Avoid:

- Full task management workflows.
- Large inline creation forms.
- Analytics that are not actionable.

### Projects

Purpose: manage project spaces and move into project-focused work.

Primary jobs:

- List projects by status.
- Create a project.
- Open a project detail/work surface.
- Show project health, progress, and task counts.
- Support project archive/paused states without hiding them permanently.

Secondary sidebar groups:

- `Views`: All projects, Active, Paused, Archived.
- `Project spaces`: active project shortcuts, sorted by recent activity or name.
- `On this page`: Project summary, Active projects, Paused projects, Archived projects.

Avoid:

- Turning the projects index into a task board.
- Showing every project setting on the index page.

### Tasks

Purpose: give users the fastest path to find, create, review, and update work across a workspace.

Primary jobs:

- Show workspace-wide tasks.
- Filter by ownership, status, priority, project, due date, and blocked state.
- Switch between table, board, list, and calendar layouts.
- Create tasks when project context is known or explicitly selected.
- Open task details in a route or right inspector.

Secondary sidebar groups:

- `Views`: All tasks, My tasks, Due soon, Blocked.
- `Layouts`: Table, Board, List, Calendar.
- `Filters`: Status, Priority, Project, Due date, Assignee when assignees exist.
- `On this page`: Overview, Priority, Status, Recent activity when those sections exist.

Avoid:

- Making layout choices look like page sections.
- Creating tasks without a clear project assignment path.
- Showing a blank tasks destination; it should be a useful workspace task hub.

### Members

Purpose: manage who belongs to the workspace and what they can do.

Primary jobs:

- Show the member directory.
- Invite members.
- Explain roles and permissions.
- Support role changes and member removal for authorized users.
- Surface ownership/admin constraints before destructive actions.

Secondary sidebar groups:

- `Management`: Directory, Invites, Roles, Ownership.
- `On this page`: Active members, Pending invites, Role matrix, Ownership rules.

Avoid:

- Hiding permission rules inside destructive forms.
- Showing role-changing controls to users who cannot use them.

### Settings

Purpose: configure workspace identity, behavior, integrations, and lifecycle.

Primary jobs:

- Edit workspace name and basic identity.
- Manage notification preferences.
- Manage integrations when they exist.
- Expose lifecycle controls such as archive/delete with strong confirmation.
- Link to member/role settings where needed without duplicating entire member management.

Secondary sidebar groups:

- `Workspace`: General, Members & roles, Notifications, Integrations.
- `Lifecycle`: Archive workspace, Delete workspace.
- `On this page`: Identity, Preferences, Integrations, Danger zone.

Avoid:

- Mixing project settings into workspace settings without clear scope.
- Putting destructive controls near everyday preferences.

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
- Use familiar app controls: icon buttons for rail navigation, segmented controls/tabs for view switching, and modals for creation flows.

## Feature Shape

Relay's MVP should move toward these primary screens:

1. Workspace shell
   - Workspace switcher
   - Persistent main icon rail
   - Reopenable main sidebar from the Relay logo
   - Dynamic secondary sidebar for the selected rail destination
   - Core sidebar destinations: Home, Projects, Tasks, Members, Settings
   - Contextual second sidebar sections for Home, Projects, Tasks, Members, and Settings
   - Quick create
   - User/account footer with dropdown menu before sign out
   - Top navbar with breadcrumb, search, and notifications

2. Projects
   - Sidebar-level project index
   - Project list/grid
   - Status/health
   - Progress and task counts
   - Create project

3. Project work view
   - Board view first
   - List/table view soon after
   - Group by status initially
   - Focused shell mode with contextual sidebar
   - Optional right inspector for project summary or selected task

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
   - Uses Details and Ask AI tabs when AI is present.
   - Remains dynamic and closable.

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
- In focused project/task mode, the right panel pairs with the dynamic secondary sidebar: the secondary sidebar changes navigation scope, while the right panel shows selected object details.

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
- Use the fullscreen Relay shell instead of a boxed dashboard frame or zoomed centered app surface.
- Keep content centered inside the fullscreen shell so the app feels spacious but not stretched.
- Make the right-side panel a dynamic product primitive, not a permanently visible empty assistant.
- Reduce generic SaaS dashboard polish in favor of a quieter work surface.

## Current Shell Decisions

The current `/app` shell uses:

- Fullscreen white app sizing with internal scrolling and centered work content.
- Reference-inspired sidebar structure: the full main sidebar is the default state, then main navigation collapses into a persistent icon rail with a dynamic secondary sidebar after the user chooses a destination.
- The Relay logo in the rail reopens the main sidebar. The main sidebar contains workspace creation, Home/Projects/Tasks/Members/Settings with labels, project shortcuts, and the account card.
- Main sidebar and rail icons navigate to Home, Projects, Tasks, Members, and Settings and reveal the dynamic secondary sidebar for that destination.
- Secondary sidebar sections are page-specific:
  - Home: Dashboard, Activity, Assigned to me, Due soon, Workspace health.
  - Projects: All projects, Active, Paused, Archived, and project spaces.
  - Tasks: All tasks, My tasks, Due soon, Blocked, plus List/Board/Calendar layout entries.
  - Members: Directory, Invites, Roles, Ownership.
  - Settings: General, Members & roles, Notifications, Integrations.
- The panel icon collapses/reopens the secondary sidebar without hiding the main rail.
- Current navigation foundation: Home, Projects, Tasks, Members, Settings in the rail/main sidebar, with account controls in the rail and main sidebar footer and search/notifications in the navbar.
- Navbar pattern from the Jira mock: desktop breadcrumb on the left, search on the right, a subtle divider, and a notification icon with badge.
- Sidebar active state is page-driven. Overview is highlighted only on the
  actual `/app` overview page, not on setup routes such as
  `/app/workspaces/new`.
- Account behavior: the sidebar account chevron opens a dropdown; sign out must not happen from a single accidental chevron click.
- Dynamic context: the right panel appears only when something is selected or when a detail route provides contextual data. It uses Details/AI tabs, is closable, and should eventually contain real project/task data before AI becomes primary.
