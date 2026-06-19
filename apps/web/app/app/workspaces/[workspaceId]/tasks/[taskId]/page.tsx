import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/features/tasks/components/task-list";
import {
  apiFetch,
  type ApiProject,
  type ApiTask,
  type ApiWorkspace,
} from "@/lib/api/server";
import { ArrowLeft, CalendarDays, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type TaskPageProps = {
  params: Promise<{
    taskId: string;
    workspaceId: string;
  }>;
};

const priorityClass = {
  low: "border-[#DCFCE7] bg-[#F0FDF4] text-[#15803D]",
  medium: "border-[#DBEAFE] bg-[#EFF6FF] text-[#2563EB]",
  high: "border-[#FEF3C7] bg-[#FFFBEB] text-[#B45309]",
  urgent: "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
};

export default async function TaskPage({ params }: TaskPageProps) {
  const { taskId, workspaceId } = await params;
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
  const { data: taskData, error: taskError } = await apiFetch<{
    tasks: ApiTask[];
  }>(`/workspaces/${workspaceId}/tasks`);

  if (taskError) {
    throw new Error(taskError);
  }

  const tasks = taskData?.tasks ?? [];
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    notFound();
  }

  const project = projects.find((item) => item.id === task.project_id);
  const doneItems = task.checklist_items.filter((item) => item.is_done).length;

  return (
    <div className="space-y-4">
      <div>
        <Button
          asChild
          variant="ghost"
          className="mb-3 h-7 rounded-[0.55rem] px-2 text-xs text-[#64748B] hover:bg-[#F4F4F5]"
        >
          <Link
            href={
              project
                ? `/app/workspaces/${workspaceId}/projects/${project.id}`
                : `/app?workspace=${workspaceId}`
            }
          >
            <ArrowLeft className="size-3.5" />
            {project ? "Project" : "Workspace"}
          </Link>
        </Button>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {workspace?.name ?? "Workspace"}
          {project ? ` / ${project.key}` : ""}
        </p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight">
              {task.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={`rounded-[0.55rem] ${priorityClass[task.priority]}`}
              >
                {task.priority}
              </Badge>
              <Badge
                variant="outline"
                className="rounded-[0.55rem] border-[#DBEAFE] bg-[#EFF6FF] text-[#2563EB]"
              >
                {task.status.replace("_", " ")}
              </Badge>
              {task.due_date ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B]">
                  <CalendarDays className="size-3.5" />
                  Due {formatDate(task.due_date)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="space-y-3">
          <div className="rounded-[0.7rem] bg-white p-3 ring-1 ring-[#EEF2F7]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
              Description
            </p>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[#64748B]">
              {task.description || "No description yet."}
            </p>
          </div>

          <div className="rounded-[0.7rem] bg-white p-3 ring-1 ring-[#EEF2F7]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
                  Checklist
                </p>
                <h2 className="mt-1 text-base font-semibold tracking-tight">
                  {doneItems}/{task.checklist_items.length} done
                </h2>
              </div>
            </div>
            {task.checklist_items.length > 0 ? (
              <div className="mt-4">
                <TaskList
                  projects={projects}
                  tasks={[task]}
                  workspaceId={workspaceId}
                />
              </div>
            ) : (
              <p className="mt-2 text-xs leading-5 text-[#64748B]">
                No checklist items yet.
              </p>
            )}
          </div>
        </div>

        <aside className="rounded-[0.7rem] bg-[#F8FAFC] p-3 ring-1 ring-[#EEF2F7]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
            Task context
          </p>
          <dl className="mt-3 space-y-3 text-xs">
            <div>
              <dt className="font-semibold text-[#334155]">Project</dt>
              <dd className="mt-1 text-[#64748B]">
                {project ? (
                  <Link
                    href={`/app/workspaces/${workspaceId}/projects/${project.id}`}
                    className="hover:text-[#007AFF]"
                  >
                    {project.key} - {project.name}
                  </Link>
                ) : (
                  "Unknown project"
                )}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[#334155]">Checklist</dt>
              <dd className="mt-1 flex items-center gap-2 text-[#64748B]">
                {doneItems === task.checklist_items.length &&
                task.checklist_items.length > 0 ? (
                  <CheckCircle2 className="size-3.5 text-[#059669]" />
                ) : (
                  <Circle className="size-3.5 text-[#94A3B8]" />
                )}
                {doneItems} of {task.checklist_items.length} complete
              </dd>
            </div>
          </dl>
        </aside>
      </section>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
