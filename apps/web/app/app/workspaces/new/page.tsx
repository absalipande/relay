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
  const selectedWorkspace = params.workspace
    ? workspaces.find((workspace) => workspace.id === params.workspace)
    : undefined;
  const panelMode =
    params.panel === "ai" || params.panel === "create"
      ? params.panel
      : "details";
  const currentUserName =
    getMetadataString(user.user_metadata?.full_name) ??
    getMetadataString(user.user_metadata?.name) ??
    getMetadataString(user.user_metadata?.display_name) ??
    user.email ??
    "Current user";

  return (
    <div className="mx-auto min-h-full w-full max-w-[1380px] py-10">
      <WorkspaceManagement
        currentUser={{
          email: user.email ?? "Unknown email",
          name: currentUserName,
        }}
        error={error ?? undefined}
        initialPanelMode={panelMode}
        initialWorkspaceId={selectedWorkspace?.id}
        workspaces={workspaces}
      />
    </div>
  );
}

function getMetadataString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}
