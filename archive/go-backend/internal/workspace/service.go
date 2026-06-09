package workspace

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/absalipande/relay/internal/permission"
)

var ErrInvalidInput = errors.New("invalid input")

type IDGenerator interface {
	Generate(ctx context.Context) (any, error)
}

type Store interface {
	CreateWorkspaceWithOwner(ctx context.Context, workspace Workspace, owner Member) (Workspace, error)
	ListWorkspacesForUser(ctx context.Context, userID string) ([]Workspace, error)
	FindWorkspaceForUser(ctx context.Context, workspaceID string, userID string) (Workspace, error)
}

type Service struct {
	store Store
	ids   IDGenerator
}

func NewService(store Store, ids IDGenerator) *Service {
	return &Service{
		store: store,
		ids:   ids,
	}
}

func (s *Service) Create(ctx context.Context, userID string, req CreateWorkspaceRequest) (WorkspaceResponse, error) {
	name := strings.TrimSpace(req.Name)
	if name == "" || len(name) > 100 || userID == "" {
		return WorkspaceResponse{}, ErrInvalidInput
	}

	workspaceID, err := s.newID(ctx)
	if err != nil {
		return WorkspaceResponse{}, err
	}

	memberID, err := s.newID(ctx)
	if err != nil {
		return WorkspaceResponse{}, err
	}

	created, err := s.store.CreateWorkspaceWithOwner(ctx, Workspace{
		ID:      workspaceID,
		Name:    name,
		OwnerID: userID,
	}, Member{
		ID:          memberID,
		WorkspaceID: workspaceID,
		UserID:      userID,
		Role:        permission.WorkspaceRoleOwner,
	})
	if err != nil {
		return WorkspaceResponse{}, err
	}

	return toResponse(created), nil
}

func (s *Service) List(ctx context.Context, userID string) ([]WorkspaceResponse, error) {
	if userID == "" {
		return nil, ErrInvalidInput
	}

	workspaces, err := s.store.ListWorkspacesForUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	return toResponses(workspaces), nil
}

func (s *Service) Get(ctx context.Context, userID string, workspaceID string) (WorkspaceResponse, error) {
	workspaceID = strings.TrimSpace(workspaceID)
	if userID == "" || workspaceID == "" {
		return WorkspaceResponse{}, ErrInvalidInput
	}

	workspace, err := s.store.FindWorkspaceForUser(ctx, workspaceID, userID)
	if err != nil {
		return WorkspaceResponse{}, err
	}

	return toResponse(workspace), nil
}

func (s *Service) newID(ctx context.Context) (string, error) {
	id, err := s.ids.Generate(ctx)
	if err != nil {
		return "", err
	}

	value := fmt.Sprint(id)
	if value == "" || value == "<nil>" {
		return "", ErrInvalidInput
	}

	return value, nil
}

func toResponses(workspaces []Workspace) []WorkspaceResponse {
	responses := make([]WorkspaceResponse, 0, len(workspaces))
	for _, workspace := range workspaces {
		responses = append(responses, toResponse(workspace))
	}
	return responses
}

func toResponse(workspace Workspace) WorkspaceResponse {
	return WorkspaceResponse{
		ID:        workspace.ID,
		Name:      workspace.Name,
		OwnerID:   workspace.OwnerID,
		CreatedAt: workspace.CreatedAt,
		UpdatedAt: workspace.UpdatedAt,
	}
}
