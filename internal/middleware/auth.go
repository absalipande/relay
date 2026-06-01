package middleware

import (
	"context"
	"fmt"
	"net/http"

	"github.com/absalipande/relay/internal/response"
	"github.com/thecodearcher/limen"
)

type contextKey string

const (
	sessionContextKey contextKey = "session"
	userIDContextKey  contextKey = "user_id"
)

func RequireSession(auth *limen.Limen) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			session, err := auth.GetSession(r)
			if err != nil {
				response.Error(w, http.StatusUnauthorized, "unauthorized", "authentication is required")
				return
			}
			if session == nil || session.Session == nil {
				response.Error(w, http.StatusUnauthorized, "unauthorized", "authentication is required")
				return
			}

			ctx := ContextWithUserID(r.Context(), fmt.Sprint(session.Session.UserID))
			ctx = context.WithValue(ctx, sessionContextKey, session)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func ContextWithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDContextKey, userID)
}

func UserIDFromContext(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(userIDContextKey).(string)
	return userID, ok && userID != ""
}

func SessionFromContext(ctx context.Context) (*limen.ValidatedSession, bool) {
	session, ok := ctx.Value(sessionContextKey).(*limen.ValidatedSession)
	return session, ok && session != nil
}
