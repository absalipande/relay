import { Badge } from "@/components/ui/badge";
import type { ApiProject, ApiTask, ApiTaskStatus } from "@/lib/api/server";
import { CalendarDays, CheckCircle2, Circle, CircleDotDashed } from "lucide-react";
import Link from "next/link";

type TaskBoardProps = {
  projects: ApiProject[];
  tasks: ApiTask[];
  workspaceId: string;
};

const statusLabels: Record<ApiTaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

const statusIcon = {
  todo: Circle,
  in_progress: CircleDotDashed,
  done: CheckCircle2,
};

const priorityClass = {
  low: "border-[#DCFCE7] bg-[#F0FDF4] text-[#15803D]",
  medium: "border-[#DBEAFE] bg-[#EFF6FF] text-[#2563EB]",
  high: "border-[#FEF3C7] bg-[#FFFBEB] text-[#B45309]",
  urgent: "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
};

export function TaskBoard({ projects, tasks, workspaceId }: TaskBoardProps) {
  return (
    <div className="grid gap-2.5 lg:grid-cols-3">
      {(["todo", "in_progress", "done"] as const).map((status) => {
        const StatusIcon = statusIcon[status];
        const columnTasks = tasks.filter((task) => task.status === status);

        return (
          <section
            key={status}
            className="min-h-[18rem] rounded-[0.7rem] bg-[#FAFAFA] p-2.5 ring-1 ring-[#ECECEC]"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <StatusIcon className="size-3.5 text-[#007AFF]" />
                <h2 className="text-xs font-semibold text-[#334155]">
                  {statusLabels[status]}
                </h2>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[#64748B] ring-1 ring-[#E4E4E7]">
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-2">
              {columnTasks.map((task) => {
                const project = projects.find(
                  (item) => item.id === task.project_id,
                );

                return (
                  <Link
                    key={task.id}
                    href={`/app/workspaces/${workspaceId}/tasks/${task.id}`}
                    className="block rounded-[0.6rem] bg-white p-2.5 ring-1 ring-[#ECECEC] transition-colors hover:bg-[#FAFAFA]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-xs font-semibold leading-4 text-[#111111]">
                        {task.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`shrink-0 rounded-[0.45rem] px-1.5 py-0 text-[0.68rem] ${priorityClass[task.priority]}`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.68rem] font-medium text-[#94A3B8]">
                      {project ? <span>{project.key}</span> : null}
                      {task.due_date ? (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3.5" />
                          {formatDate(task.due_date)}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
