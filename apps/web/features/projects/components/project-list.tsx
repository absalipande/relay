"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApiProject } from "@/lib/api/server";
import { archiveProject } from "@/features/projects/actions";
import {
  Archive,
  CalendarDays,
  FolderKanban,
  MoreHorizontal,
} from "lucide-react";
import { useActionState } from "react";

type ProjectListProps = {
  projects: ApiProject[];
  workspaceId: string;
};

const initialState = {
  message: null,
};

export function ProjectList({ projects, workspaceId }: ProjectListProps) {
  const visibleProjects = projects.filter(
    (project) => project.status !== "archived",
  );

  if (visibleProjects.length === 0) {
    return (
      <div className="grid min-h-[150px] place-items-center rounded-[0.9rem] border border-dashed border-[#D8E0EA] bg-[#F8FAFC] p-5 text-center">
        <div className="max-w-sm">
          <FolderKanban className="mx-auto size-6 text-[#94A3B8]" />
          <h3 className="mt-3 text-sm font-semibold text-[#334155]">
            No projects yet
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            Create a project to collect tasks, dates, owners, and updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#F1F5F9] overflow-hidden rounded-[0.9rem] ring-1 ring-[#EEF2F7]">
      {visibleProjects.map((project) => (
        <ProjectRow key={project.id} project={project} workspaceId={workspaceId} />
      ))}
    </div>
  );
}

function ProjectRow({
  project,
  workspaceId,
}: {
  project: ApiProject;
  workspaceId: string;
}) {
  const [state, formAction, pending] = useActionState(
    archiveProject,
    initialState,
  );
  const createdAt = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(project.created_at));

  return (
    <article className="grid gap-4 bg-white p-4 transition-colors hover:bg-[#FAFAFA] md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
          <span className="max-w-24 truncate rounded-[0.55rem] bg-[#EEF6FF] px-2.5 py-1.5 text-xs font-semibold leading-none text-[#007AFF]">
            {project.key}
          </span>
          <h3 className="truncate text-sm font-semibold text-[#111111]">
            {project.name}
          </h3>
          <Badge
            variant="outline"
            className="rounded-[0.55rem] border-[#DBEAFE] bg-[#EFF6FF] text-[#2563EB]"
          >
            {project.status}
          </Badge>
        </div>
        {project.description ? (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#64748B]">
            {project.description}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-[#94A3B8]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            Created {createdAt}
          </span>
          {state.message ? (
            <span className="text-[#DC2626]">{state.message}</span>
          ) : null}
        </div>
      </div>

      <form action={formAction} className="flex items-start justify-end gap-2">
        <input type="hidden" name="workspaceId" value={workspaceId} />
        <input type="hidden" name="projectId" value={project.id} />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={pending}
          className="size-9 rounded-[0.75rem] text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111111]"
          aria-label={`Archive ${project.name}`}
        >
          {pending ? (
            <MoreHorizontal className="size-4" />
          ) : (
            <Archive className="size-4" />
          )}
        </Button>
      </form>
    </article>
  );
}
