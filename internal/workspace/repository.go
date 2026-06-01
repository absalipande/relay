package workspace

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("workspace not found")

type Workspace struct {
	ID        string
	Name      string
	OwnerID   string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Member struct {
	ID          string
	WorkspaceID string
	UserID      string
	Role        string
}

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateWorkspaceWithOwner(ctx context.Context, workspace Workspace, owner Member) (Workspace, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return Workspace{}, err
	}
	defer tx.Rollback(ctx)

	row := tx.QueryRow(ctx, `
		INSERT INTO workspaces (id, name, owner_id)
		VALUES ($1, $2, $3)
		RETURNING id, name, owner_id, created_at, updated_at
	`, workspace.ID, workspace.Name, workspace.OwnerID)

	created, err := scanWorkspace(row)
	if err != nil {
		return Workspace{}, err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO workspace_members (id, workspace_id, user_id, role)
		VALUES ($1, $2, $3, $4)
	`, owner.ID, owner.WorkspaceID, owner.UserID, owner.Role)
	if err != nil {
		return Workspace{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return Workspace{}, err
	}

	return created, nil
}

func (r *Repository) ListWorkspacesForUser(ctx context.Context, userID string) ([]Workspace, error) {
	rows, err := r.db.Query(ctx, `
		SELECT workspaces.id, workspaces.name, workspaces.owner_id, workspaces.created_at, workspaces.updated_at
		FROM workspaces
		JOIN workspace_members ON workspace_members.workspace_id = workspaces.id
		WHERE workspace_members.user_id = $1
		ORDER BY workspaces.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	workspaces := []Workspace{}
	for rows.Next() {
		workspace, err := scanWorkspace(rows)
		if err != nil {
			return nil, err
		}
		workspaces = append(workspaces, workspace)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return workspaces, nil
}

func (r *Repository) FindWorkspaceForUser(ctx context.Context, workspaceID string, userID string) (Workspace, error) {
	row := r.db.QueryRow(ctx, `
		SELECT workspaces.id, workspaces.name, workspaces.owner_id, workspaces.created_at, workspaces.updated_at
		FROM workspaces
		JOIN workspace_members ON workspace_members.workspace_id = workspaces.id
		WHERE workspaces.id = $1 AND workspace_members.user_id = $2
	`, workspaceID, userID)

	return scanWorkspace(row)
}

type scanner interface {
	Scan(dest ...any) error
}

func scanWorkspace(row scanner) (Workspace, error) {
	var workspace Workspace
	if err := row.Scan(&workspace.ID, &workspace.Name, &workspace.OwnerID, &workspace.CreatedAt, &workspace.UpdatedAt); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Workspace{}, ErrNotFound
		}

		return Workspace{}, err
	}

	return workspace, nil
}
