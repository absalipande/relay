# Local Backend Setup

This guide brings up Relay against a real local PostgreSQL database.

## Requirements

- Go 1.25+
- PostgreSQL 15+
- Limen CLI
- Goose CLI

Relay currently uses the local Go SDK at:

```sh
/Users/absalipande/sdk/go1.26.3/bin/go
```

## Environment

Create `.env` from the example:

```sh
cp .env.example .env
```

Use a local database URL like:

```sh
DATABASE_URL=postgres://absalipande@localhost:5432/relay?sslmode=disable
```

Homebrew PostgreSQL usually creates a database role matching your macOS username, not a `postgres` role.

`LIMEN_SECRET` must be exactly 32 bytes.

## Install CLIs

```sh
make install-tools
```

The project Makefile calls the installed binaries by absolute path:

```txt
/Users/absalipande/go/bin/limen
/Users/absalipande/go/bin/goose
```

## Create The Database

If you already have PostgreSQL running locally:

```sh
createdb relay
```

If the database already exists, this can be skipped.

If `make auth-schema` says `connection refused`, PostgreSQL is not running on `localhost:5432`. Start PostgreSQL first, then rerun `createdb relay`.

Common Homebrew commands:

```sh
brew services list
brew services start postgresql@16
```

If your installed service has a different version, use that name instead, such as `postgresql@15` or `postgresql@14`.

## Generate Limen Auth Migrations

Limen owns auth tables, including `users`, `sessions`, `accounts`, `verifications`, and rate-limit tables.

First export Limen's schema JSON:

```sh
make auth-schema
```

If this reports `DATABASE_URL is required`, make sure you are using the latest Makefile or create `.env` from `.env.example`.

Then generate SQL migrations:

```sh
make auth-migrations
```

This writes Limen migrations to:

```txt
migrations/auth/
```

Limen emits paired `*.up.sql` and `*.down.sql` files. Relay converts them into Goose-compatible single migration files automatically.

## Apply Migrations

Apply Limen auth migrations first because Relay app tables reference `users(id)`:

```sh
make migrate-auth
```

Then apply Relay app migrations:

```sh
make migrate-app
```

Relay uses separate Goose version tables for auth and app migrations:

```txt
goose_auth_db_version
goose_app_db_version
```

This keeps Limen-generated auth migration versions separate from Relay app migration versions.

Known-good local run:

```txt
make migrate-auth
make migrate-app
make run
```

Expected successful API startup:

```txt
api listening addr=:8080 env=development
```

## Run Tests

```sh
make test
```

## Run The API

```sh
make run
```

Health check:

```sh
curl http://localhost:8080/health
```

## Workspace Flow

Once signed in through Limen, authenticated requests can call:

```txt
POST /workspaces
GET /workspaces
GET /workspaces/{workspaceId}
```
