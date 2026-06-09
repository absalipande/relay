package workspace

import "time"

type CreateWorkspaceRequest struct {
	Name string `json:"name"`
}

type WorkspaceResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	OwnerID   string    `json:"owner_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateWorkspaceResponse struct {
	Workspace WorkspaceResponse `json:"workspace"`
}

type ListWorkspacesResponse struct {
	Workspaces []WorkspaceResponse `json:"workspaces"`
}
