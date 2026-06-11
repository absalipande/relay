import { Badge } from "@/components/ui/badge";
import type { ApiProject, ApiTask } from "@/lib/api/server";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

type TaskTableProps = {
  projects: ApiProject[];
  tasks: ApiTask[];
  workspaceId: string;
};

const priorityClass = {
  low: "border-[#DCFCE7] bg-[#F0FDF4] text-[#15803D]",
  medium: "border-[#DBEAFE] bg-[#EFF6FF] text-[#2563EB]",
  high: "border-[#FEF3C7] bg-[#FFFBEB] text-[#B45309]",
  urgent: "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
};

export function TaskTable({ projects, tasks, workspaceId }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="grid min-h-[220px] place-items-center rounded-[0.85rem] border border-dashed border-[#D8E0EA] bg-[#F8FAFC] p-6 text-center">
        <div>
          <h3 className="text-sm font-semibold text-[#334155]">
            No tasks yet
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            Create a task to start building this project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[0.85rem] ring-1 ring-[#EEF2F7]">
      <div className="grid grid-cols-[minmax(0,1fr)_8rem_8rem_9rem] gap-3 bg-[#F8FAFC] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
        <span>Task</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Due date</span>
      </div>
      <div className="divide-y divide-[#F1F5F9] bg-white">
        {tasks.map((task) => {
          const project = projects.find((item) => item.id === task.project_id);

          return (
            <Link
              key={task.id}
              href={`/app/workspaces/${workspaceId}/tasks/${task.id}`}
              className="grid grid-cols-[minmax(0,1fr)_8rem_8rem_9rem] gap-3 px-4 py-3 text-sm transition-colors hover:bg-[#FAFAFA]"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-[#111111]">
                  {task.title}
                </span>
                {project ? (
                  <span className="mt-1 block truncate text-xs font-medium text-[#94A3B8]">
                    {project.key} - {project.name}
                  </span>
                ) : null}
              </span>
              <span className="self-center text-xs font-medium capitalize text-[#64748B]">
                {task.status.replace("_", " ")}
              </span>
              <span className="self-center">
                <Badge
                  variant="outline"
                  className={`rounded-[0.55rem] ${priorityClass[task.priority]}`}
                >
                  {task.priority}
                </Badge>
              </span>
              <span className="inline-flex items-center gap-1.5 self-center text-xs font-medium text-[#64748B]">
                {task.due_date ? (
                  <>
                    <CalendarDays className="size-3.5" />
                    {formatDate(task.due_date)}
                  </>
                ) : (
                  "No date"
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
