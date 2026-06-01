package middleware

import (
	"context"
	"net/http"

	"github.com/absalipande/relay/internal/response"
	"github.com/thecodearcher/limen"
)

type contextKey string

const sessionContextKey contextKey = "session"

func RequireSession(auth *limen.Limen) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			session, err := auth.GetSession(r)
			if err != nil {
				response.Error(w, http.StatusUnauthorized, "unauthorized", "authentication is required")
				return
			}

			ctx := context.WithValue(r.Context(), sessionContextKey, session)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func SessionFromContext(ctx context.Context) (any, bool) {
	session := ctx.Value(sessionContextKey)
	ok := session != nil
	return session, ok && session != nil
}
