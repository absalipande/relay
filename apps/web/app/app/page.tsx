import { apiFetch, type ApiWorkspace } from "@/lib/api/server";
import { redirect } from "next/navigation";

type AppHomeProps = {
  searchParams: Promise<{
    workspace?: string;
  }>;
};

export default async function AppHome({ searchParams }: AppHomeProps) {
  const params = await searchParams;
  const { data, error } = await apiFetch<{ workspaces: ApiWorkspace[] }>(
    "/workspaces",
  );
  const workspaces = data?.workspaces ?? [];

  if (!error && workspaces.length === 0) {
    redirect("/app/workspaces?panel=create");
  }

  if (
    params.workspace &&
    !workspaces.some((workspace) => workspace.id === params.workspace)
  ) {
    redirect("/app");
  }

  return <div aria-hidden="true" />;
}
