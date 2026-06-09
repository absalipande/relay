package main

import (
	"log/slog"
	"os"

	"github.com/absalipande/relay/internal/app"
	"github.com/absalipande/relay/internal/config"
	"github.com/absalipande/relay/internal/database"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	cfg, err := config.Load()
	if err != nil {
		logger.Error("load config", "error", err)
		os.Exit(1)
	}

	db, err := database.ConnectGORM(cfg.DatabaseURL)
	if err != nil {
		logger.Error("connect auth database", "error", err)
		os.Exit(1)
	}

	if _, err := app.NewAuth(db, cfg); err != nil {
		logger.Error("export auth schema", "error", err)
		os.Exit(1)
	}

	logger.Info("auth schema exported", "path", ".limen/schemas.json")
}
