# Relay

Relay is a lightweight ClickUp/Jira-style project tracker for small teams, built as a serious Go backend learning project with a clean SaaS-style architecture.

## Planned stack

- Go REST API
- Chi router
- PostgreSQL
- pgx/sqlc later
- SQL migrations
- JWT access tokens and refresh tokens later

## First backend foundation

This scaffold includes:

- `cmd/api/main.go`
- Chi router
- `GET /health`
- environment config loader
- PostgreSQL connection setup
- JSON response helpers
- error response helpers
- auth middleware placeholder
- permission package placeholder
- migrations folder
- VS Code settings and extension recommendations

## Run locally

Go is not currently available on this machine's shell PATH. After installing Go, run:

```sh
cp .env.example .env
go mod tidy
go run ./cmd/api
```

Then visit:

```txt
http://localhost:8080/health
```
