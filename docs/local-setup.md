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
DATABASE_URL=postgres://postgres:postgres@localhost:5432/relay?sslmode=disable
```

`LIMEN_SECRET` must be exactly 32 bytes.

## Install CLIs

```sh
/Users/absalipande/sdk/go1.26.3/bin/go install github.com/thecodearcher/limen/cmd/limen@latest
/Users/absalipande/sdk/go1.26.3/bin/go install github.com/pressly/goose/v3/cmd/goose@latest
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

Then generate SQL migrations:

```sh
make auth-migrations
```

This writes Limen migrations to:

```txt
migrations/auth/
```

## Apply Migrations

Apply Limen auth migrations first because Relay app tables reference `users(id)`:

```sh
make migrate-auth
```

Then apply Relay app migrations:

```sh
make migrate-app
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
