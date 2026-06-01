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

	"github.com/absalipande/relay/internal/app"
	"github.com/absalipande/relay/internal/config"
	"github.com/absalipande/relay/internal/database"
	"github.com/absalipande/relay/internal/id"
	relaymw "github.com/absalipande/relay/internal/middleware"
	"github.com/absalipande/relay/internal/workspace"
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

	limenAuth, err := app.NewAuth(authDB, cfg)
	if err != nil {
		logger.Error("initialize auth", "error", err)
		os.Exit(1)
	}

	workspaceRepository := workspace.NewRepository(db)
	workspaceService := workspace.NewService(workspaceRepository, id.NewUUIDGenerator())
	workspaceHandler := workspace.NewHandler(workspaceService)

	router := chi.NewRouter()
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(relaymw.RequestLogger(logger))
	router.Use(middleware.Recoverer)

	registerHealthRoutes(router)

	router.Handle("/auth/*", limenAuth.Handler())
	router.Group(func(r chi.Router) {
		r.Use(relaymw.RequireSession(limenAuth))
		workspace.RegisterRoutes(r, workspaceHandler)
	})

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
