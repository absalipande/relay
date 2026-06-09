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

After installing Go and PostgreSQL, run:

```sh
cp .env.example .env
make install-tools
make test
make auth-schema
make auth-migrations
make migrate-auth
make migrate-app
make run
```

Then visit:

```txt
http://localhost:8080/health
```

Before running the API, set `LIMEN_SECRET` in `.env` to a random 32-byte value.

## Auth migrations

Limen needs its own auth tables. In development, Relay enables Limen's CLI schema export so `make auth-schema` can create `.limen/schemas.json`. Then `make auth-migrations` generates Goose-compatible auth migrations.

```sh
make auth-schema
make auth-migrations
```

See [docs/local-setup.md](docs/local-setup.md) for the full local database setup.

## Testing

Relay uses Go's built-in test runner. Unit and route tests live beside the packages they cover in `*_test.go` files.

```sh
go test ./...
```

The initial automated tests cover config loading, permission policy helpers, JSON/error responses, and the health route.

## Backend progress

Backend implementation progress is tracked in [docs/backend-checklist.md](docs/backend-checklist.md).

Product feature planning is tracked in [docs/product-roadmap.md](docs/product-roadmap.md).
