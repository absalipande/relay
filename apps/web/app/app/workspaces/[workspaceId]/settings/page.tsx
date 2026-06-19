import { apiFetch, type ApiWorkspace } from "@/lib/api/server";
import { Archive, KeyRound, Settings, Shield } from "lucide-react";
import { notFound } from "next/navigation";
import type React from "react";

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
    <div className="space-y-6">
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Workspace settings
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold leading-tight tracking-tight">
          {workspace.name}
        </h1>
        <p className="mt-1 text-xs leading-5 text-[#64748B]">
          Keep workspace identity, permissions, and lifecycle controls predictable.
        </p>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <SettingMetric icon={Settings} label="Workspace" value={workspace.name} />
        <SettingMetric icon={KeyRound} label="Slug" value={workspace.slug} />
        <SettingMetric icon={Shield} label="Your role" value={capitalize(workspace.role)} />
      </section>

      <section className="overflow-hidden rounded-[0.8rem] border border-[#EEF2F7] bg-white">
        <SettingRow
          label="Workspace profile"
          value="Rename and slug controls will connect here."
        />
        <SettingRow
          label="Permissions"
          value="Role-gated member and project controls will be managed here."
        />
        <SettingRow
          label="Invite access"
          value="Invite code reset and pending invite settings will appear here."
        />
      </section>

      <section className="rounded-[0.8rem] border border-[#FEE2E2] bg-white p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-[0.65rem] bg-[#FEF2F2] text-[#DC2626]">
            <Archive className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Archive workspace</h2>
            <p className="mt-1 text-xs leading-5 text-[#64748B]">
              Owners will be able to archive or delete this workspace after a confirmation flow is
              implemented.
            </p>
          </div>
          <button className="h-8 rounded-[0.65rem] border border-[#FEE2E2] px-3 text-xs font-semibold text-[#DC2626]">
            Coming soon
          </button>
        </div>
      </section>
    </div>
  );
}

function SettingMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[0.75rem] border border-[#EEF2F7] bg-white p-3">
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-[0.55rem] bg-[#EFF6FF] text-[#007AFF]">
          <Icon className="size-3.5" />
        </span>
        <p className="text-xs font-semibold text-[#475569]">{label}</p>
      </div>
      <p className="mt-4 truncate text-sm font-semibold tracking-tight">{value}</p>
    </article>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 border-b border-[#EEF2F7] px-4 py-3 last:border-b-0 md:grid-cols-[14rem_minmax(0,1fr)]">
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs leading-5 text-[#64748B]">{value}</p>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
