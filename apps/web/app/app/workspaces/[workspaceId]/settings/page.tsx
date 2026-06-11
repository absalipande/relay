import { apiFetch, type ApiWorkspace } from "@/lib/api/server";
import { notFound } from "next/navigation";

type WorkspaceSettingsPageProps = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export default async function WorkspaceSettingsPage({
  params,
}: WorkspaceSettingsPageProps) {
  const { workspaceId } = await params;
  const { data } = await apiFetch<{ workspaces: ApiWorkspace[] }>(
    "/workspaces",
  );
  const workspace = data?.workspaces.find((item) => item.id === workspaceId);

  if (!workspace) {
    notFound();
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Workspace settings
        </p>
        <h1 className="mt-3 text-[32px] font-semibold leading-tight tracking-tight">
          {workspace.name}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#64748B]">
          Rename, archive, invite, and permission controls will live here.
        </p>
      </div>
    </div>
  );
}
