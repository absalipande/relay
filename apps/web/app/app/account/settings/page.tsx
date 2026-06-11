import { AccountSettingsContent } from "@/features/account/components/account-pages";
import { apiFetch, type ApiWorkspace } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data } = await apiFetch<{ workspaces: ApiWorkspace[] }>(
    "/workspaces",
  );
  const workspaces = data?.workspaces ?? [];
  const fullName = getUserName(user.user_metadata, user.email);

  return (
    <AccountSettingsContent
      user={{
        email: user.email ?? "Unknown email",
        fullName,
        initials: getInitials(fullName),
        joinedLabel: user.created_at
          ? new Intl.DateTimeFormat("en", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(user.created_at))
          : "Unknown",
        roleLabel: getWorkspaceRoleLabel(workspaces),
        workspaceAccessLabel: getWorkspaceAccessLabel(workspaces.length),
      }}
    />
  );
}

function getUserName(metadata: Record<string, unknown>, email?: string) {
  return (
    getMetadataString(metadata.full_name) ??
    getMetadataString(metadata.name) ??
    getMetadataString(metadata.display_name) ??
    email ??
    "Current user"
  );
}

function getMetadataString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "R";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getWorkspaceRoleLabel(workspaces: ApiWorkspace[]) {
  if (workspaces.length === 0) {
    return "No workspace yet";
  }

  if (workspaces.length === 1) {
    return `${capitalize(workspaces[0].role)} in ${workspaces[0].name}`;
  }

  const roleCounts = workspaces.reduce<Record<string, number>>(
    (counts, workspace) => {
      counts[workspace.role] = (counts[workspace.role] ?? 0) + 1;
      return counts;
    },
    {},
  );
  const summary = Object.entries(roleCounts)
    .sort(([leftRole], [rightRole]) => leftRole.localeCompare(rightRole))
    .map(([role, count]) => `${count} ${capitalize(role)}`)
    .join(", ");

  return `${workspaces.length} workspace roles: ${summary}`;
}

function getWorkspaceAccessLabel(workspaceCount: number) {
  if (workspaceCount === 0) {
    return "Create a workspace";
  }

  if (workspaceCount === 1) {
    return "1 workspace";
  }

  return `${workspaceCount} workspaces`;
}

function capitalize(value: string) {
  return value.length > 0
    ? `${value.charAt(0).toUpperCase()}${value.slice(1)}`
    : value;
}
