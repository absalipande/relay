GO ?= /Users/absalipande/sdk/go1.26.3/bin/go
GOCACHE ?= $(PWD)/.gocache
DATABASE_URL ?= postgres://postgres:postgres@localhost:5432/relay?sslmode=disable
LIMEN ?= /Users/absalipande/go/bin/limen
GOOSE ?= /Users/absalipande/go/bin/goose

.PHONY: install-tools tidy test run auth-schema auth-migrations migrate-auth migrate-app

install-tools:
	$(GO) install github.com/thecodearcher/limen/cmd/limen@latest
	$(GO) install github.com/pressly/goose/v3/cmd/goose@latest

tidy:
	$(GO) mod tidy

test:
	GOCACHE=$(GOCACHE) $(GO) test ./...

run:
	$(GO) run ./cmd/api

auth-schema:
	$(GO) run ./cmd/authschema

auth-migrations:
	$(LIMEN) generate migrations --driver postgres --dsn "$(DATABASE_URL)" --output ./migrations/auth

migrate-auth:
	$(GOOSE) -dir ./migrations/auth postgres "$(DATABASE_URL)" up

migrate-app:
	$(GOOSE) -dir ./migrations postgres "$(DATABASE_URL)" up
