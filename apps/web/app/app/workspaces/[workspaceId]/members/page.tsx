import { apiFetch, type ApiWorkspace } from "@/lib/api/server";
import { notFound } from "next/navigation";

type WorkspaceMembersPageProps = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export default async function WorkspaceMembersPage({
  params,
}: WorkspaceMembersPageProps) {
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
          Members
        </p>
        <h1 className="mt-3 text-[32px] font-semibold leading-tight tracking-tight">
          {workspace.name}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#64748B]">
          Member list, invite codes, role updates, and removals will live here.
        </p>
      </div>
    </div>
  );
}
