import { apiFetch, type ApiWorkspace } from "@/lib/api/server";
import { notFound } from "next/navigation";

type WorkspaceProjectsPageProps = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export default async function WorkspaceProjectsPage({
  params,
}: WorkspaceProjectsPageProps) {
  const { workspaceId } = await params;
  const { data } = await apiFetch<{ workspaces: ApiWorkspace[] }>(
    "/workspaces",
  );
  const workspace = data?.workspaces.find((item) => item.id === workspaceId);

  if (!workspace) {
    notFound();
  }

  return <div aria-hidden="true" />;
}
