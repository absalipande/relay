package permission

func CanInviteWorkspaceMembers(role string) bool {
	return role == WorkspaceRoleOwner || role == WorkspaceRoleAdmin
}

func CanDeleteWorkspace(role string) bool {
	return role == WorkspaceRoleOwner
}

func CanCreateProject(role string) bool {
	return role == WorkspaceRoleOwner || role == WorkspaceRoleAdmin || role == WorkspaceRoleMember
}

func CanUpdateProject(role string) bool {
	return role == ProjectRoleManager
}

func CanArchiveProject(role string) bool {
	return role == ProjectRoleManager
}

func CanCreateTask(role string) bool {
	return role == ProjectRoleManager || role == ProjectRoleContributor
}

func CanUpdateTask(role string) bool {
	return role == ProjectRoleManager || role == ProjectRoleContributor
}

func CanComment(role string) bool {
	return role == ProjectRoleManager || role == ProjectRoleContributor || role == ProjectRoleViewer
}
