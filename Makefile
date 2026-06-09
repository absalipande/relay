GO ?= /Users/absalipande/sdk/go1.26.3/bin/go
GOBIN ?= /Users/absalipande/go/bin
GOCACHE ?= $(PWD)/.gocache
APP_ENV ?= development
BASE_URL ?= http://localhost:8080
HTTP_ADDR ?= :8080
DB_USER ?= $(shell whoami)
DATABASE_URL ?= postgres://$(DB_USER)@localhost:5432/relay?sslmode=disable
LIMEN_SECRET ?= 0123456789abcdef0123456789abcdef
LIMEN ?= $(GOBIN)/limen
GOOSE ?= $(GOBIN)/goose
GOOSE_AUTH_TABLE ?= goose_auth_db_version
GOOSE_APP_TABLE ?= goose_app_db_version

export APP_ENV
export BASE_URL
export HTTP_ADDR
export DATABASE_URL
export LIMEN_SECRET

.PHONY: install-tools tidy test run auth-schema auth-migrations migrate-auth migrate-app

install-tools:
	GOBIN=$(GOBIN) $(GO) install github.com/thecodearcher/limen/cmd/limen@latest
	GOBIN=$(GOBIN) $(GO) install github.com/pressly/goose/v3/cmd/goose@latest

tidy:
	$(GO) mod tidy

test:
	GOCACHE=$(GOCACHE) $(GO) test ./...

run:
	$(GO) run ./cmd/api

auth-schema:
	$(GO) run ./cmd/authschema

auth-migrations:
	mkdir -p ./migrations/auth
	$(LIMEN) generate migrations --driver postgres --dsn "$(DATABASE_URL)" --output ./migrations/auth
	sh ./scripts/limen_migrations_to_goose.sh ./migrations/auth

migrate-auth:
	$(GOOSE) -dir ./migrations/auth -table $(GOOSE_AUTH_TABLE) postgres "$(DATABASE_URL)" up

migrate-app:
	$(GOOSE) -dir ./migrations -table $(GOOSE_APP_TABLE) postgres "$(DATABASE_URL)" up
