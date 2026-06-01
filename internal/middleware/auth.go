package middleware

import (
	"net/http"

	"github.com/absalipande/relay/internal/response"
)

func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		response.Error(w, http.StatusUnauthorized, "unauthorized", "authentication is not implemented yet")
	})
}
