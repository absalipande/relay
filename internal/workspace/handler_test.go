package workspace

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/absalipande/relay/internal/middleware"
)

type fakeWorkspaceService struct {
	createReq CreateWorkspaceRequest
	userID    string
	err       error
}

func (s *fakeWorkspaceService) Create(_ context.Context, userID string, req CreateWorkspaceRequest) (WorkspaceResponse, error) {
	s.userID = userID
	s.createReq = req
	if s.err != nil {
		return WorkspaceResponse{}, s.err
	}

	return WorkspaceResponse{ID: "workspace-id", Name: req.Name, OwnerID: userID}, nil
}

func (s *fakeWorkspaceService) List(context.Context, string) ([]WorkspaceResponse, error) {
	if s.err != nil {
		return nil, s.err
	}

	return []WorkspaceResponse{{ID: "workspace-id", Name: "Product", OwnerID: "user-id"}}, nil
}

func (s *fakeWorkspaceService) Get(context.Context, string, string) (WorkspaceResponse, error) {
	if s.err != nil {
		return WorkspaceResponse{}, s.err
	}

	return WorkspaceResponse{ID: "workspace-id", Name: "Product", OwnerID: "user-id"}, nil
}

func TestHandlerCreateWorkspace(t *testing.T) {
	service := &fakeWorkspaceService{}
	router := chi.NewRouter()
	RegisterRoutes(router, NewHandler(service))

	body := bytes.NewBufferString(`{"name":"Product"}`)
	req := httptest.NewRequest(http.MethodPost, "/workspaces", body)
	req = req.WithContext(middleware.ContextWithUserID(req.Context(), "user-id"))
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d", http.StatusCreated, rec.Code)
	}

	if service.userID != "user-id" {
		t.Fatalf("expected service user id user-id, got %q", service.userID)
	}

	if service.createReq.Name != "Product" {
		t.Fatalf("expected request name Product, got %q", service.createReq.Name)
	}
}

func TestHandlerCreateRequiresAuth(t *testing.T) {
	router := chi.NewRouter()
	RegisterRoutes(router, NewHandler(&fakeWorkspaceService{}))

	req := httptest.NewRequest(http.MethodPost, "/workspaces", bytes.NewBufferString(`{"name":"Product"}`))
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
	}
}

func TestHandlerCreateInvalidInput(t *testing.T) {
	router := chi.NewRouter()
	RegisterRoutes(router, NewHandler(&fakeWorkspaceService{err: ErrInvalidInput}))

	req := httptest.NewRequest(http.MethodPost, "/workspaces", bytes.NewBufferString(`{"name":""}`))
	req = req.WithContext(middleware.ContextWithUserID(req.Context(), "user-id"))
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, rec.Code)
	}
}

func TestHandlerListWorkspaces(t *testing.T) {
	router := chi.NewRouter()
	RegisterRoutes(router, NewHandler(&fakeWorkspaceService{}))

	req := httptest.NewRequest(http.MethodGet, "/workspaces", nil)
	req = req.WithContext(middleware.ContextWithUserID(req.Context(), "user-id"))
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}

	var body ListWorkspacesResponse
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("decode response body: %v", err)
	}

	if len(body.Workspaces) != 1 {
		t.Fatalf("expected one workspace, got %d", len(body.Workspaces))
	}
}

func TestHandlerGetWorkspaceNotFound(t *testing.T) {
	router := chi.NewRouter()
	RegisterRoutes(router, NewHandler(&fakeWorkspaceService{err: ErrNotFound}))

	req := httptest.NewRequest(http.MethodGet, "/workspaces/workspace-id", nil)
	req = req.WithContext(middleware.ContextWithUserID(req.Context(), "user-id"))
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected status %d, got %d", http.StatusNotFound, rec.Code)
	}
}

func TestHandlerUnexpectedError(t *testing.T) {
	router := chi.NewRouter()
	RegisterRoutes(router, NewHandler(&fakeWorkspaceService{err: errors.New("boom")}))

	req := httptest.NewRequest(http.MethodGet, "/workspaces", nil)
	req = req.WithContext(middleware.ContextWithUserID(req.Context(), "user-id"))
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("expected status %d, got %d", http.StatusInternalServerError, rec.Code)
	}
}
