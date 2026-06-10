import { RelayAppShell } from "@/features/app-shell/components/relay-app-shell";
import { WorkspaceContextPanel } from "@/features/workspaces/components/workspace-context-panel";
import { WorkspaceList } from "@/features/workspaces/components/workspace-list";
import { apiFetch, type ApiWorkspace } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type AppHomeProps = {
  searchParams: Promise<{
    workspace?: string;
    panel?: string;
  }>;
};

export default async function AppHome({ searchParams }: AppHomeProps) {
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
  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.id === params.workspace,
  );
  const activeWorkspace = selectedWorkspace ?? workspaces[0];
  const panelMode = params.panel === "ai" ? "ai" : "details";

  return (
    <RelayAppShell
      email={user.email ?? "Unknown user"}
      hasWorkspace={workspaces.length > 0}
      workspaceName={activeWorkspace?.name}
      context={
        selectedWorkspace ? (
          <WorkspaceContextPanel
            workspace={selectedWorkspace}
            mode={panelMode}
          />
        ) : undefined
      }
    >
      <div className="space-y-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Workspace home
            </p>
            <h1 className="mt-3 text-[32px] font-semibold leading-tight tracking-tight">
              {activeWorkspace ? activeWorkspace.name : "Create workspace"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              {activeWorkspace
                ? "Plan projects, tasks, and team activity from this workspace."
                : "Set up the workspace that will hold your projects and tasks."}
            </p>
          </div>
        </div>

        <section>
          <WorkspaceList
            workspaces={workspaces}
            error={error ?? undefined}
            selectedWorkspaceId={selectedWorkspace?.id}
          />
        </section>
      </div>
    </RelayAppShell>
  );
}
