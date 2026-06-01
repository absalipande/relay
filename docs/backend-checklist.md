# Relay Backend Checklist

This checklist tracks backend progress against the planning document.

## Phase 1 - Backend Foundation

- [x] Go module
- [x] Chi router
- [x] Health check route: `GET /health`
- [x] Environment config loader
- [x] PostgreSQL connection setup
- [x] JSON response helpers
- [x] Error response helpers
- [x] Request logging middleware
- [x] Permission package placeholders
- [x] SQL migrations folder
- [x] Automated tests for config, responses, permissions, and health route

## Phase 2 - Authentication

- [x] Limen auth integration
- [x] Credential/password auth plugin
- [x] Limen GORM/Postgres adapter setup
- [x] Limen auth mounted at `/auth/*`
- [x] UUID ID generator shared by Limen and Relay app tables
- [x] Session middleware for protected Relay routes
- [x] Add auth schema export command
- [ ] Generate and apply Limen auth migrations locally
- [ ] Add OAuth provider plugin
- [ ] Add email verification flow

## Phase 3 - Workspaces

- [x] Workspace tables: `workspaces`, `workspace_members`
- [x] Workspace package structure: DTO, repository, service, handler
- [x] Create workspace: `POST /workspaces`
- [x] List current user's workspaces: `GET /workspaces`
- [x] View workspace details: `GET /workspaces/{workspaceId}`
- [x] Creator automatically becomes workspace owner
- [x] Unit tests for workspace service behavior
- [x] Handler tests for workspace routes and errors
- [ ] Update workspace: `PATCH /workspaces/{workspaceId}`
- [ ] Delete workspace: `DELETE /workspaces/{workspaceId}`
- [ ] Workspace member management routes

## Phase 4 - Projects

- [ ] Project tables
- [ ] Create project under workspace
- [ ] List projects under workspace
- [ ] View project details
- [ ] Update project
- [ ] Archive project
- [ ] Project member management
- [ ] Project permission checks

## Phase 5 - Tasks

- [ ] Task tables
- [ ] Create task
- [ ] Assign task
- [ ] Update status
- [ ] Update priority
- [ ] Comments
- [ ] Activity logs

## Test Commands

```sh
go mod tidy
go test ./...
go test ./internal/workspace -v
go test ./cmd/api -v
```

## Migration Notes

Limen owns auth tables, including `users`. Generate and apply Limen auth migrations before applying Relay app migrations.

Relay app migrations currently start with workspace tables and assume Limen's `users(id)` table exists with UUID primary keys.
