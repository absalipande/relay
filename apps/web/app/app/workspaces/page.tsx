import { WorkspaceManagement } from "@/features/workspaces/components/workspace-management";
import { apiFetch, type ApiProject, type ApiWorkspace } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type WorkspacesPageProps = {
  searchParams: Promise<{
    panel?: string;
    workspace?: string;
  }>;
};

export default async function WorkspacesPage({
  searchParams,
}: WorkspacesPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data, error } = await apiFetch<{ workspaces: ApiWorkspace[] }>(
    "/workspaces",
  );
  const workspaces = data?.workspaces ?? [];
  const projectCounts = await getProjectCounts(workspaces);
  const selectedWorkspace = params.workspace
    ? workspaces.find((workspace) => workspace.id === params.workspace)
    : undefined;
  const panelMode =
    params.panel === "ai" || params.panel === "create"
      ? params.panel
      : workspaces.length === 0
        ? "create"
        : "details";
  const currentUserName =
    getMetadataString(user.user_metadata?.full_name) ??
    getMetadataString(user.user_metadata?.name) ??
    getMetadataString(user.user_metadata?.display_name) ??
    user.email ??
    "Current user";

  return (
    <div className="min-h-full w-full">
      <WorkspaceManagement
        currentUser={{
          email: user.email ?? "Unknown email",
          name: currentUserName,
        }}
        error={error ?? undefined}
        initialPanelMode={panelMode}
        initialWorkspaceId={selectedWorkspace?.id}
        projectCounts={projectCounts}
        workspaces={workspaces}
      />
    </div>
  );
}

async function getProjectCounts(workspaces: ApiWorkspace[]) {
  const entries = await Promise.all(
    workspaces.map(async (workspace) => {
      const { data } = await apiFetch<{ projects: ApiProject[] }>(
        `/workspaces/${workspace.id}/projects`,
      );

      return [workspace.id, data?.projects.length ?? 0] as const;
    }),
  );

  return Object.fromEntries(entries);
}

function getMetadataString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}
