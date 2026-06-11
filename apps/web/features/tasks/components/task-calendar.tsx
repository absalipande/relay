import type { ApiTask } from "@/lib/api/server";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

type TaskCalendarProps = {
  tasks: ApiTask[];
  workspaceId: string;
};

export function TaskCalendar({ tasks, workspaceId }: TaskCalendarProps) {
  const datedTasks = tasks.filter((task) => task.due_date);

  if (datedTasks.length === 0) {
    return (
      <div className="grid min-h-[220px] place-items-center rounded-[0.85rem] border border-dashed border-[#D8E0EA] bg-[#F8FAFC] p-6 text-center">
        <div>
          <CalendarDays className="mx-auto size-6 text-[#94A3B8]" />
          <h3 className="mt-3 text-sm font-semibold text-[#334155]">
            No dated tasks
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            Add due dates to see project work on a calendar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2 rounded-[0.85rem] bg-[#F8FAFC] p-3 ring-1 ring-[#EEF2F7]">
      {datedTasks.map((task) => (
        <Link
          key={task.id}
          href={`/app/workspaces/${workspaceId}/tasks/${task.id}`}
          className="flex items-center justify-between gap-3 rounded-[0.75rem] bg-white px-3 py-2.5 text-sm ring-1 ring-[#EEF2F7] transition-colors hover:bg-[#FAFAFA]"
        >
          <span className="truncate font-semibold text-[#111111]">
            {task.title}
          </span>
          <span className="shrink-0 text-xs font-medium text-[#64748B]">
            {formatDate(task.due_date!)}
          </span>
        </Link>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
