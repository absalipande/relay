import { RelayAppShell } from "@/features/app-shell/components/relay-app-shell";
import { apiFetch, type ApiWorkspace } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <RelayAppShell
      displayName={getUserName(user.user_metadata, user.email)}
      email={user.email ?? "Unknown user"}
      hasWorkspace={workspaces.length > 0}
      workspaces={workspaces}
      workspaceName={workspaces[0]?.name}
    >
      {children}
    </RelayAppShell>
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
