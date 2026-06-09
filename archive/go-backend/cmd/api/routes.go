package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/absalipande/relay/internal/response"
)

func registerHealthRoutes(router chi.Router) {
	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		response.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
}
