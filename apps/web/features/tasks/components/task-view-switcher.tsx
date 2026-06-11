import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ApiProject, ApiTask } from "@/lib/api/server";
import type { ReactNode } from "react";
import { TaskBoard } from "./task-board";
import { TaskCalendar } from "./task-calendar";
import { TaskList } from "./task-list";
import { TaskTable } from "./task-table";

type TaskViewSwitcherProps = {
  actions?: ReactNode;
  filters?: ReactNode;
  query?: {
    dueDate?: string;
    priority?: string;
    status?: string;
  };
  projects: ApiProject[];
  tasks: ApiTask[];
  view?: string;
  workspaceId: string;
};

export function TaskViewSwitcher({
  actions,
  filters,
  projects,
  query,
  tasks,
  view,
  workspaceId,
}: TaskViewSwitcherProps) {
  const activeView =
    view === "kanban" || view === "calendar" || view === "list"
      ? view
      : "table";
  const tableHref = buildViewHref("table", query);
  const kanbanHref = buildViewHref("kanban", query);
  const calendarHref = buildViewHref("calendar", query);

  return (
    <Tabs
      value={activeView}
      className="overflow-hidden rounded-[0.95rem] bg-white p-4 ring-1 ring-[#EEF2F7]"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <TabsList className="h-9 rounded-[0.8rem] bg-[#F4F4F5]">
          <TabsTrigger
            value="table"
            asChild
            className="h-7 rounded-[0.65rem] px-3 text-xs"
          >
            <a href={tableHref}>Table</a>
          </TabsTrigger>
          <TabsTrigger
            value="kanban"
            asChild
            className="h-7 rounded-[0.65rem] px-3 text-xs"
          >
            <a href={kanbanHref}>Kanban</a>
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            asChild
            className="h-7 rounded-[0.65rem] px-3 text-xs"
          >
            <a href={calendarHref}>Calendar</a>
          </TabsTrigger>
        </TabsList>
        {actions}
      </div>

      {filters ? (
        <div className="border-y border-[#F1F5F9] py-4">{filters}</div>
      ) : null}

      <TabsContent value="table" className="mt-0">
        <TaskTable
          projects={projects}
          tasks={tasks}
          workspaceId={workspaceId}
        />
      </TabsContent>
      <TabsContent value="kanban" className="mt-0">
        <TaskBoard
          projects={projects}
          tasks={tasks}
          workspaceId={workspaceId}
        />
      </TabsContent>
      <TabsContent value="calendar" className="mt-0">
        <TaskCalendar tasks={tasks} workspaceId={workspaceId} />
      </TabsContent>
      <TabsContent value="list" className="mt-0">
        <TaskList projects={projects} tasks={tasks} workspaceId={workspaceId} />
      </TabsContent>
    </Tabs>
  );
}

function buildViewHref(
  view: "calendar" | "kanban" | "table",
  query?: {
    dueDate?: string;
    priority?: string;
    status?: string;
  },
) {
  const params = new URLSearchParams();
  params.set("view", view);

  if (query?.status) params.set("status", query.status);
  if (query?.priority) params.set("priority", query.priority);
  if (query?.dueDate) params.set("dueDate", query.dueDate);

  return `?${params.toString()}`;
}
