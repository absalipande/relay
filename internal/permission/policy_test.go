package permission

import "testing"

func TestWorkspacePermissions(t *testing.T) {
	tests := []struct {
		name        string
		role        string
		canInvite   bool
		canDelete   bool
		canCreate   bool
	}{
		{name: "owner", role: WorkspaceRoleOwner, canInvite: true, canDelete: true, canCreate: true},
		{name: "admin", role: WorkspaceRoleAdmin, canInvite: true, canDelete: false, canCreate: true},
		{name: "member", role: WorkspaceRoleMember, canInvite: false, canDelete: false, canCreate: true},
		{name: "viewer", role: WorkspaceRoleViewer, canInvite: false, canDelete: false, canCreate: false},
		{name: "unknown", role: "unknown", canInvite: false, canDelete: false, canCreate: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := CanInviteWorkspaceMembers(tt.role); got != tt.canInvite {
				t.Fatalf("CanInviteWorkspaceMembers(%q) = %v, want %v", tt.role, got, tt.canInvite)
			}

			if got := CanDeleteWorkspace(tt.role); got != tt.canDelete {
				t.Fatalf("CanDeleteWorkspace(%q) = %v, want %v", tt.role, got, tt.canDelete)
			}

			if got := CanCreateProject(tt.role); got != tt.canCreate {
				t.Fatalf("CanCreateProject(%q) = %v, want %v", tt.role, got, tt.canCreate)
			}
		})
	}
}

func TestProjectPermissions(t *testing.T) {
	tests := []struct {
		name       string
		role       string
		canUpdate  bool
		canArchive bool
		canCreate  bool
		canComment bool
	}{
		{name: "manager", role: ProjectRoleManager, canUpdate: true, canArchive: true, canCreate: true, canComment: true},
		{name: "contributor", role: ProjectRoleContributor, canUpdate: false, canArchive: false, canCreate: true, canComment: true},
		{name: "viewer", role: ProjectRoleViewer, canUpdate: false, canArchive: false, canCreate: false, canComment: true},
		{name: "unknown", role: "unknown", canUpdate: false, canArchive: false, canCreate: false, canComment: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := CanUpdateProject(tt.role); got != tt.canUpdate {
				t.Fatalf("CanUpdateProject(%q) = %v, want %v", tt.role, got, tt.canUpdate)
			}

			if got := CanArchiveProject(tt.role); got != tt.canArchive {
				t.Fatalf("CanArchiveProject(%q) = %v, want %v", tt.role, got, tt.canArchive)
			}

			if got := CanCreateTask(tt.role); got != tt.canCreate {
				t.Fatalf("CanCreateTask(%q) = %v, want %v", tt.role, got, tt.canCreate)
			}

			if got := CanComment(tt.role); got != tt.canComment {
				t.Fatalf("CanComment(%q) = %v, want %v", tt.role, got, tt.canComment)
			}
		})
	}
}
