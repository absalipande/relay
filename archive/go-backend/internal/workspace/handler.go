package workspace

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/absalipande/relay/internal/middleware"
	"github.com/absalipande/relay/internal/response"
)

type service interface {
	Create(ctx context.Context, userID string, req CreateWorkspaceRequest) (WorkspaceResponse, error)
	List(ctx context.Context, userID string) ([]WorkspaceResponse, error)
	Get(ctx context.Context, userID string, workspaceID string) (WorkspaceResponse, error)
}

type Handler struct {
	service service
}

func NewHandler(service service) *Handler {
	return &Handler{service: service}
}

func RegisterRoutes(router chi.Router, handler *Handler) {
	router.Post("/workspaces", handler.Create)
	router.Get("/workspaces", handler.List)
	router.Get("/workspaces/{workspaceId}", handler.Get)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized", "authentication is required")
		return
	}

	var req CreateWorkspaceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid_json", "request body must be valid JSON")
		return
	}

	workspace, err := h.service.Create(r.Context(), userID, req)
	if err != nil {
		writeError(w, err)
		return
	}

	response.JSON(w, http.StatusCreated, CreateWorkspaceResponse{Workspace: workspace})
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized", "authentication is required")
		return
	}

	workspaces, err := h.service.List(r.Context(), userID)
	if err != nil {
		writeError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, ListWorkspacesResponse{Workspaces: workspaces})
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized", "authentication is required")
		return
	}

	workspace, err := h.service.Get(r.Context(), userID, chi.URLParam(r, "workspaceId"))
	if err != nil {
		writeError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, CreateWorkspaceResponse{Workspace: workspace})
}

func writeError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrInvalidInput):
		response.Error(w, http.StatusBadRequest, "invalid_input", "workspace name is required and must be 100 characters or fewer")
	case errors.Is(err, ErrNotFound):
		response.Error(w, http.StatusNotFound, "not_found", "workspace was not found")
	default:
		response.Error(w, http.StatusInternalServerError, "internal_error", "something went wrong")
	}
}
