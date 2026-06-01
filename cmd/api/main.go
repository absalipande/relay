package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/thecodearcher/limen"
	gormadapter "github.com/thecodearcher/limen/adapters/gorm"
	credentialpassword "github.com/thecodearcher/limen/plugins/credential-password"

	"github.com/absalipande/relay/internal/config"
	"github.com/absalipande/relay/internal/database"
	relaymw "github.com/absalipande/relay/internal/middleware"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	cfg, err := config.Load()
	if err != nil {
		logger.Error("load config", "error", err)
		os.Exit(1)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	db, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		logger.Error("connect database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	authDB, err := database.ConnectGORM(cfg.DatabaseURL)
	if err != nil {
		logger.Error("connect auth database", "error", err)
		os.Exit(1)
	}

	limenAuth, err := limen.New(&limen.Config{
		BaseURL:  cfg.BaseURL,
		Database: gormadapter.New(authDB),
		Secret:   []byte(cfg.LimenSecret),
		CLI: &limen.CLIConfig{
			Enabled: cfg.AppEnv != "production",
		},
		HTTP: limen.NewDefaultHTTPConfig(
			limen.WithHTTPCookieSecure(cfg.AppEnv == "production"),
		),
		Plugins: []limen.Plugin{
			credentialpassword.New(),
		},
	})
	if err != nil {
		logger.Error("initialize auth", "error", err)
		os.Exit(1)
	}

	router := chi.NewRouter()
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(relaymw.RequestLogger(logger))
	router.Use(middleware.Recoverer)

	registerHealthRoutes(router)

	router.Handle("/auth/*", limenAuth.Handler())

	server := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		logger.Info("api listening", "addr", cfg.HTTPAddr, "env", cfg.AppEnv)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("http server", "error", err)
			stop()
		}
	}()

	<-ctx.Done()

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		logger.Error("shutdown server", "error", err)
		os.Exit(1)
	}
}
