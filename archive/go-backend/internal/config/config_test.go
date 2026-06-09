package config

import "testing"

func TestLoadUsesDefaults(t *testing.T) {
	t.Setenv("APP_ENV", "")
	t.Setenv("BASE_URL", "")
	t.Setenv("HTTP_ADDR", "")
	t.Setenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/relay?sslmode=disable")
	t.Setenv("LIMEN_SECRET", "0123456789abcdef0123456789abcdef")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("load config: %v", err)
	}

	if cfg.AppEnv != "development" {
		t.Fatalf("expected default app env development, got %q", cfg.AppEnv)
	}

	if cfg.BaseURL != "http://localhost:8080" {
		t.Fatalf("expected default base url, got %q", cfg.BaseURL)
	}

	if cfg.HTTPAddr != ":8080" {
		t.Fatalf("expected default http addr, got %q", cfg.HTTPAddr)
	}
}

func TestLoadRequiresDatabaseURL(t *testing.T) {
	t.Setenv("DATABASE_URL", "")
	t.Setenv("LIMEN_SECRET", "0123456789abcdef0123456789abcdef")

	if _, err := Load(); err == nil {
		t.Fatal("expected missing DATABASE_URL to return an error")
	}
}

func TestLoadRequires32ByteLimenSecret(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/relay?sslmode=disable")
	t.Setenv("LIMEN_SECRET", "too-short")

	if _, err := Load(); err == nil {
		t.Fatal("expected invalid LIMEN_SECRET to return an error")
	}
}
