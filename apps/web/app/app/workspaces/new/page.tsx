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
  const query = new URLSearchParams();

  query.set("panel", params.panel ?? "create");

  if (params.workspace) {
    query.set("workspace", params.workspace);
  }

  redirect(`/app/workspaces?${query.toString()}`);
}
