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
import { notFound } from "next/navigation";

type WorkspaceTasksPageProps = {
  params: Promise<{
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

export default async function WorkspaceTasksPage({
  params,
  searchParams,
}: WorkspaceTasksPageProps) {
  const { workspaceId } = await params;
  const filters = await searchParams;
  const { data: workspaceData } = await apiFetch<{
    workspaces: ApiWorkspace[];
  }>("/workspaces");
  const workspace = workspaceData?.workspaces.find(
    (item) => item.id === workspaceId,
  );

  if (!workspace) {
    notFound();
  }

  const { data: projectData, error: projectError } = await apiFetch<{
    projects: ApiProject[];
  }>(`/workspaces/${workspaceId}/projects`);
  const { data: taskData, error: taskError } = await apiFetch<{
    tasks: ApiTask[];
  }>(`/workspaces/${workspaceId}/tasks`);

  if (projectError || taskError) {
    throw new Error(projectError ?? taskError ?? "Could not load tasks.");
  }

  const tasks = filterTasks(taskData?.tasks ?? [], filters);

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            My tasks
          </p>
          <h1 className="mt-3 text-[32px] font-semibold leading-tight tracking-tight">
            {workspace.name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            Review workspace tasks across projects.
          </p>
        </div>
        <TaskUrlFilters />
      </div>

      <TaskViewSwitcher
        projects={projectData?.projects ?? []}
        query={filters}
        tasks={tasks}
        view={filters.view}
        workspaceId={workspaceId}
      />
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
