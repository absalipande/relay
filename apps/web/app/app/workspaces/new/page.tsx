import { RelayAppShell } from "@/features/app-shell/components/relay-app-shell";
import { WorkspaceManagement } from "@/features/workspaces/components/workspace-management";
import { apiFetch, type ApiWorkspace } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type NewWorkspacePageProps = {
  searchParams: Promise<{
    panel?: string;
    workspace?: string;
  }>;
};

export default async function NewWorkspacePage({
  searchParams,
}: NewWorkspacePageProps) {
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
  const activeWorkspace = workspaces[0];
  const selectedWorkspace = params.workspace
    ? workspaces.find((workspace) => workspace.id === params.workspace)
    : undefined;
  const panelMode =
    params.panel === "ai" || params.panel === "create"
      ? params.panel
      : "details";

  return (
    <RelayAppShell
      email={user.email ?? "Unknown user"}
      hasWorkspace={workspaces.length > 0}
      workspaceName={activeWorkspace?.name}
    >
      <div className="mx-auto min-h-full w-full max-w-[1380px] py-10">
        <WorkspaceManagement
          error={error ?? undefined}
          initialPanelMode={panelMode}
          initialWorkspaceId={selectedWorkspace?.id}
          workspaces={workspaces}
        />
      </div>
    </RelayAppShell>
  );
}
