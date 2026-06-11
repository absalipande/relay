"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  toggleChecklistItem,
  updateTaskStatus,
} from "@/features/tasks/actions";
import type { ApiProject, ApiTask, ApiTaskStatus } from "@/lib/api/server";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  CircleDotDashed,
  ListChecks,
} from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

type TaskListProps = {
  projects: ApiProject[];
  tasks: ApiTask[];
  workspaceId: string;
};

const initialState = {
  message: null,
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

export function TaskList({ projects, tasks, workspaceId }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="grid min-h-[150px] place-items-center rounded-[0.9rem] border border-dashed border-[#D8E0EA] bg-[#F8FAFC] p-5 text-center">
        <div className="max-w-sm">
          <ListChecks className="mx-auto size-6 text-[#94A3B8]" />
          <h3 className="mt-3 text-sm font-semibold text-[#334155]">
            No tasks yet
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            Add a task to track ownership, due dates, and checklist progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(["todo", "in_progress", "done"] as const).map((status) => {
        const groupTasks = tasks.filter((task) => task.status === status);
        if (groupTasks.length === 0) return null;

        return (
          <section key={status}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
                {statusLabels[status]}
              </span>
              <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs font-semibold text-[#64748B]">
                {groupTasks.length}
              </span>
            </div>
            <div className="divide-y divide-[#F1F5F9] overflow-hidden rounded-[0.9rem] ring-1 ring-[#EEF2F7]">
              {groupTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  projects={projects}
                  task={task}
                  workspaceId={workspaceId}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TaskRow({
  projects,
  task,
  workspaceId,
}: {
  projects: ApiProject[];
  task: ApiTask;
  workspaceId: string;
}) {
  const project = projects.find((item) => item.id === task.project_id);
  const StatusIcon = statusIcon[task.status];
  const doneItems = task.checklist_items.filter((item) => item.is_done).length;

  return (
    <article className="bg-white p-4 transition-colors hover:bg-[#FAFAFA]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <StatusIcon className="size-4 text-[#007AFF]" />
            <Link
              href={`/app/workspaces/${workspaceId}/tasks/${task.id}`}
              className="truncate text-sm font-semibold text-[#111111] hover:text-[#007AFF]"
            >
              {task.title}
            </Link>
            <Badge
              variant="outline"
              className={`rounded-[0.55rem] ${priorityClass[task.priority]}`}
            >
              {task.priority}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-[#94A3B8]">
            {project ? (
              <span>
                {project.key} - {project.name}
              </span>
            ) : null}
            {task.due_date ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                Due {formatDate(task.due_date)}
              </span>
            ) : null}
            {task.checklist_items.length > 0 ? (
              <span>
                {doneItems}/{task.checklist_items.length} checklist
              </span>
            ) : null}
          </div>
          {task.description ? (
            <p className="mt-3 text-sm leading-6 text-[#64748B]">
              {task.description}
            </p>
          ) : null}
        </div>

        <TaskStatusControls task={task} workspaceId={workspaceId} />
      </div>

      {task.checklist_items.length > 0 ? (
        <div className="mt-4 space-y-2 rounded-[0.8rem] bg-[#F8FAFC] p-3">
          {task.checklist_items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              isDone={item.is_done}
              itemId={item.id}
              title={item.title}
              workspaceId={workspaceId}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function TaskStatusControls({
  task,
  workspaceId,
}: {
  task: ApiTask;
  workspaceId: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-[0.75rem] bg-[#F4F4F5] p-1">
      {(["todo", "in_progress", "done"] as const).map((status) => (
        <TaskStatusButton
          key={status}
          active={task.status === status}
          status={status}
          taskId={task.id}
          workspaceId={workspaceId}
        />
      ))}
    </div>
  );
}

function TaskStatusButton({
  active,
  status,
  taskId,
  workspaceId,
}: {
  active: boolean;
  status: ApiTaskStatus;
  taskId: string;
  workspaceId: string;
}) {
  const [, formAction, pending] = useActionState(updateTaskStatus, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="status" value={status} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={pending || active}
        className={`h-7 rounded-[0.55rem] px-2 text-xs ${
          active
            ? "bg-white text-[#007AFF] shadow-sm"
            : "text-[#64748B] hover:bg-white hover:text-[#111111]"
        }`}
      >
        {statusLabels[status]}
      </Button>
    </form>
  );
}

function ChecklistItemRow({
  isDone,
  itemId,
  title,
  workspaceId,
}: {
  isDone: boolean;
  itemId: string;
  title: string;
  workspaceId: string;
}) {
  const [, formAction, pending] = useActionState(
    toggleChecklistItem,
    initialState,
  );
  const Icon = isDone ? CheckCircle2 : Circle;

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="itemId" value={itemId} />
      <input type="hidden" name="isDone" value={String(!isDone)} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={pending}
        className="size-6 shrink-0 rounded-full text-[#94A3B8] hover:bg-white hover:text-[#007AFF]"
        aria-label={isDone ? `Mark ${title} incomplete` : `Mark ${title} done`}
      >
        <Icon className={`size-4 ${isDone ? "text-[#059669]" : ""}`} />
      </Button>
      <span
        className={`text-sm ${
          isDone ? "text-[#94A3B8] line-through" : "text-[#334155]"
        }`}
      >
        {title}
      </span>
    </form>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
