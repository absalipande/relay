package workspace

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/absalipande/relay/internal/permission"
)

type fakeIDGenerator struct {
	ids []any
}

func (g *fakeIDGenerator) Generate(context.Context) (any, error) {
	if len(g.ids) == 0 {
		return "", errors.New("no ids left")
	}

	id := g.ids[0]
	g.ids = g.ids[1:]
	return id, nil
}

type fakeStore struct {
	createdWorkspace Workspace
	createdOwner     Member
	listResult       []Workspace
	getResult        Workspace
	err              error
}

func (s *fakeStore) CreateWorkspaceWithOwner(_ context.Context, workspace Workspace, owner Member) (Workspace, error) {
	s.createdWorkspace = workspace
	s.createdOwner = owner
	if s.err != nil {
		return Workspace{}, s.err
	}

	workspace.CreatedAt = time.Unix(1, 0).UTC()
	workspace.UpdatedAt = time.Unix(2, 0).UTC()
	return workspace, nil
}

func (s *fakeStore) ListWorkspacesForUser(context.Context, string) ([]Workspace, error) {
	return s.listResult, s.err
}

func (s *fakeStore) FindWorkspaceForUser(context.Context, string, string) (Workspace, error) {
	return s.getResult, s.err
}

func TestServiceCreateCreatesOwnerMembership(t *testing.T) {
	store := &fakeStore{}
	service := NewService(store, &fakeIDGenerator{ids: []any{"workspace-id", "member-id"}})

	workspace, err := service.Create(context.Background(), "user-id", CreateWorkspaceRequest{Name: "  Product  "})
	if err != nil {
		t.Fatalf("create workspace: %v", err)
	}

	if workspace.ID != "workspace-id" {
		t.Fatalf("expected workspace id, got %q", workspace.ID)
	}

	if workspace.Name != "Product" {
		t.Fatalf("expected trimmed workspace name, got %q", workspace.Name)
	}

	if store.createdWorkspace.OwnerID != "user-id" {
		t.Fatalf("expected owner id user-id, got %q", store.createdWorkspace.OwnerID)
	}

	if store.createdOwner.Role != permission.WorkspaceRoleOwner {
		t.Fatalf("expected owner membership role, got %q", store.createdOwner.Role)
	}
}

func TestServiceCreateValidatesName(t *testing.T) {
	service := NewService(&fakeStore{}, &fakeIDGenerator{ids: []any{"workspace-id", "member-id"}})

	if _, err := service.Create(context.Background(), "user-id", CreateWorkspaceRequest{Name: ""}); !errors.Is(err, ErrInvalidInput) {
		t.Fatalf("expected invalid input error, got %v", err)
	}
}

func TestServiceListRequiresUser(t *testing.T) {
	service := NewService(&fakeStore{}, &fakeIDGenerator{})

	if _, err := service.List(context.Background(), ""); !errors.Is(err, ErrInvalidInput) {
		t.Fatalf("expected invalid input error, got %v", err)
	}
}

func TestServiceGetReturnsWorkspace(t *testing.T) {
	store := &fakeStore{
		getResult: Workspace{
			ID:      "workspace-id",
			Name:    "Product",
			OwnerID: "user-id",
		},
	}
	service := NewService(store, &fakeIDGenerator{})

	workspace, err := service.Get(context.Background(), "user-id", "workspace-id")
	if err != nil {
		t.Fatalf("get workspace: %v", err)
	}

	if workspace.ID != "workspace-id" {
		t.Fatalf("expected workspace-id, got %q", workspace.ID)
	}
}
