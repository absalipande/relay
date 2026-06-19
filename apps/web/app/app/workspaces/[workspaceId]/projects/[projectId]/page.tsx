import { Button } from "@/components/ui/button";
import { TaskCreateDialog } from "@/features/tasks/components/task-create-dialog";
import { TaskUrlFilters } from "@/features/tasks/components/task-url-filters";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import {
  apiFetch,
  type ApiProject,
  type ApiTask,
  type ApiTaskPriority,
  type ApiTaskStatus,
  type ApiWorkspace,
} from "@/lib/api/server";
import { ArrowLeft, FolderKanban } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type ProjectPageProps = {
  params: Promise<{
    projectId: string;
    workspaceId: string;
  }>;
  searchParams: Promise<{
    dueDate?: string;
    priority?: string;
    status?: string;
    view?: string;
  }>;
};

const taskStatuses = ["todo", "in_progress", "done"] as const;
const taskPriorities = ["low", "medium", "high", "urgent"] as const;

export default async function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const { projectId, workspaceId } = await params;
  const filters = await searchParams;

  const { data: workspaceData } = await apiFetch<{
    workspaces: ApiWorkspace[];
  }>("/workspaces");
  const workspace = workspaceData?.workspaces.find(
    (item) => item.id === workspaceId,
  );

  const { data: projectData, error: projectError } = await apiFetch<{
    projects: ApiProject[];
  }>(`/workspaces/${workspaceId}/projects`);

  if (projectError) {
    throw new Error(projectError);
  }

  const projects = projectData?.projects ?? [];
  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    notFound();
  }

  const { data: taskData, error: taskError } = await apiFetch<{
    tasks: ApiTask[];
  }>(`/workspaces/${workspaceId}/tasks?projectId=${projectId}`);

  if (taskError) {
    throw new Error(taskError);
  }

  const tasks = filterTasks(taskData?.tasks ?? [], filters);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Button
            asChild
            variant="ghost"
            className="mb-3 h-7 rounded-[0.55rem] px-2 text-xs text-[#64748B] hover:bg-[#F4F4F5]"
          >
            <Link href={`/app?workspace=${workspaceId}`}>
              <ArrowLeft className="size-3.5" />
              Workspace
            </Link>
          </Button>
          <div className="flex min-w-0 items-start gap-2">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[0.6rem] bg-[#EEF6FF] text-[#007AFF]">
              <FolderKanban className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {workspace?.name ?? "Workspace"} / {project.key}
              </p>
              <h1 className="mt-1 truncate text-2xl font-semibold leading-tight tracking-tight">
                {project.name}
              </h1>
              {project.description ? (
                <p className="mt-1 max-w-3xl text-xs leading-5 text-[#64748B]">
                  {project.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>

      </div>

      <section className="space-y-2">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
            Project tasks
          </p>
          <h2 className="mt-1 text-base font-semibold tracking-tight">
            {tasks.length} visible
          </h2>
        </div>
        <TaskViewSwitcher
          actions={
            <TaskCreateDialog
              lockedProjectId={project.id}
              projects={projects}
              workspaceId={workspaceId}
            />
          }
          filters={<TaskUrlFilters />}
          projects={projects}
          query={filters}
          tasks={tasks}
          view={filters.view}
          workspaceId={workspaceId}
        />
      </section>
    </div>
  );
}

function filterTasks(
  tasks: ApiTask[],
  filters: {
    dueDate?: string;
    priority?: string;
    status?: string;
  },
) {
  return tasks.filter((task) => {
    if (isTaskStatus(filters.status) && task.status !== filters.status) {
      return false;
    }

    if (isTaskPriority(filters.priority) && task.priority !== filters.priority) {
      return false;
    }

    if (filters.dueDate && task.due_date !== filters.dueDate) {
      return false;
    }

    return true;
  });
}

function isTaskStatus(value: string | undefined): value is ApiTaskStatus {
  return taskStatuses.includes(value as ApiTaskStatus);
}

function isTaskPriority(value: string | undefined): value is ApiTaskPriority {
  return taskPriorities.includes(value as ApiTaskPriority);
}
