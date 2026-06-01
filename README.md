# Relay

Relay is a lightweight ClickUp/Jira-style project tracker for small teams, built as a serious Go backend learning project with a clean SaaS-style architecture.

## Planned stack

- Go REST API
- Chi router
- PostgreSQL
- pgx/sqlc later
- SQL migrations
- Limen authentication
- OAuth/social providers later

## First backend foundation

This scaffold includes:

- `cmd/api/main.go`
- Chi router
- `GET /health`
- environment config loader
- PostgreSQL connection setup
- JSON response helpers
- error response helpers
- Limen auth mounted at `/auth/*`
- credential/password auth plugin
- auth database adapter setup
- permission package placeholder
- migrations folder
- VS Code settings and extension recommendations

## Auth

Relay uses [Limen](https://limenauth.dev/) for authentication. Limen owns the auth routes, auth tables, sessions, password hashing, CSRF/origin checks, and future OAuth/social-provider support.

The API mounts Limen under:

```txt
/auth/*
```

The initial auth plugin is credential/password. OAuth providers can be added later through Limen plugins.

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

Before running the API, set `LIMEN_SECRET` in `.env` to a random 32-byte value.

## Auth migrations

Limen needs its own auth tables. In development, Relay enables Limen's CLI schema export so the first app run can create `.limen/schemas.json`. After Go and the Limen CLI are available, generate the Limen migrations for Postgres and apply them with your migration tool:

```sh
limen generate migrations --driver postgres --dsn "$DATABASE_URL"
```

## Testing

Relay uses Go's built-in test runner. Unit and route tests live beside the packages they cover in `*_test.go` files.

```sh
go test ./...
```

The initial automated tests cover config loading, permission policy helpers, JSON/error responses, and the health route.
