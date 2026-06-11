import { Button } from "@/components/ui/button";
import { ProjectCreateDialog } from "@/features/projects/components/project-create-dialog";
import { ProjectList } from "@/features/projects/components/project-list";
import { TaskList } from "@/features/tasks/components/task-list";
import type { ApiProject, ApiTask } from "@/lib/api/server";
import type { ComponentType, ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  FolderKanban,
  ListTodo,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";

type WorkspaceListProps = {
  projects?: ApiProject[];
  projectError?: string;
  taskError?: string;
  tasks?: ApiTask[];
  workspaces: {
    id: string;
    name: string;
    slug: string;
    created_at: string;
    role: string;
  }[];
  error?: string;
  selectedWorkspaceId?: string;
};

export function WorkspaceList({
  projects = [],
  projectError,
  taskError,
  tasks = [],
  workspaces,
  error,
  selectedWorkspaceId,
}: WorkspaceListProps) {
  if (error) {
    return (
      <div className="min-h-[360px] rounded-[1rem] border border-[#FECACA] bg-[#FEF2F2] p-5">
        <p className="text-sm font-semibold text-[#DC2626]">Setup needed</p>
        <h2 className="mt-3 text-xl font-semibold">
          Could not load workspaces
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#7F1D1D]">{error}</p>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return <FirstRunPanel />;
  }

  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ??
    workspaces[0];

  return (
    <WorkspaceDashboard
      workspace={activeWorkspace}
      projects={projects}
      projectError={projectError}
      taskError={taskError}
      tasks={tasks}
    />
  );
}

function FirstRunPanel() {
  return (
    <div className="rounded-[1.15rem] border border-[#E4E4E7] bg-[#FAFAFA] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#007AFF]">
        First run
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">
        Start with a workspace
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#64748B]">
        Create a top-level home for your team, product, client, or company.
        Projects and tasks will live inside that workspace.
      </p>

      <Button
        asChild
        className="mt-6 h-10 rounded-[0.8rem] bg-[#007AFF] px-4 text-white hover:bg-[#006be0]"
      >
        <Link href="/app/workspaces/new">
          <Plus className="size-4" />
          Create workspace
        </Link>
      </Button>
    </div>
  );
}

type WorkspaceDashboardProps = {
  projects: ApiProject[];
  projectError?: string;
  taskError?: string;
  tasks: ApiTask[];
  workspace: WorkspaceListProps["workspaces"][number];
};

function WorkspaceDashboard({
  projects,
  projectError,
  taskError,
  tasks,
  workspace,
}: WorkspaceDashboardProps) {
  const createdAt = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(workspace.created_at));
  const activeProjects = projects.filter((project) => project.status === "active");
  const pausedProjects = projects.filter((project) => project.status === "paused");
  const archivedProjects = projects.filter(
    (project) => project.status === "archived",
  );
  const openTasks = tasks.filter((task) => task.status !== "done");
  const dueSoonTasks = tasks.filter(
    (task) => task.due_date && task.status !== "done",
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {workspace.name} workspace
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            Here is what is happening across this workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="h-9 rounded-[0.8rem] border-[#E4E4E7] bg-white text-[#334155]"
          >
            <Settings className="size-4" />
            Customize
          </Button>
          <ProjectCreateDialog
            workspaceId={workspace.id}
            workspaceName={workspace.name}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          label="Active projects"
          value={String(activeProjects.length)}
          detail={
            activeProjects.length === 1
              ? "1 project in motion"
              : `${activeProjects.length} projects in motion`
          }
          icon={FolderKanban}
          tone="blue"
        />
        <MetricCard
          label="Open tasks"
          value={String(openTasks.length)}
          detail={
            openTasks.length === 1
              ? "1 task still open"
              : `${openTasks.length} tasks still open`
          }
          icon={ListTodo}
          tone="indigo"
        />
        <MetricCard
          label="Due soon"
          value={String(dueSoonTasks.length)}
          detail={
            dueSoonTasks.length > 0
              ? "Tasks with due dates"
              : "No deadlines yet"
          }
          icon={Clock3}
          tone="amber"
        />
        <MetricCard
          label="Members"
          value="1"
          detail={`You are ${workspace.role}`}
          icon={Users}
          tone="green"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_0.95fr]">
        <Panel
          id="projects"
          title="Projects"
          subtitle="Active project spaces in this workspace."
        >
          {projectError ? (
            <ErrorPanel title="Could not load projects" message={projectError} />
          ) : (
            <ProjectList projects={projects} workspaceId={workspace.id} />
          )}
        </Panel>

        <Panel
          title="Task status"
          subtitle="A lightweight readout before the board view arrives."
        >
          <EmptyRows
            rows={[
              `${tasks.filter((task) => task.status === "todo").length} to do`,
              `${
                tasks.filter((task) => task.status === "in_progress").length
              } in progress`,
              `${tasks.filter((task) => task.status === "done").length} done`,
              `${activeProjects.length} active projects`,
            ]}
            completedFirst={tasks.some((task) => task.status === "done")}
          />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_0.95fr]">
        <Panel id="tasks" title="Tasks" subtitle="Project work grouped by status.">
          {taskError ? (
            <ErrorPanel title="Could not load tasks" message={taskError} />
          ) : (
            <TaskList
              projects={projects}
              tasks={tasks}
              workspaceId={workspace.id}
            />
          )}
        </Panel>

        <Panel title="Recent activity" subtitle="Workspace updates will collect here.">
          <EmptyRows
            rows={[
              `Workspace created on ${createdAt}`,
              activeProjects.length > 0
                ? `${activeProjects.length} active project spaces`
                : "Project updates will appear here",
              openTasks.length > 0
                ? `${openTasks.length} open tasks`
                : "Task comments will appear here",
            ]}
            completedFirst
          />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_0.95fr]">
        <Panel title="Project status" subtitle="Simple project lifecycle counts.">
          <EmptyRows
            rows={[
              `${activeProjects.length} active`,
              `${pausedProjects.length} paused`,
              `${archivedProjects.length} archived`,
            ]}
            completedFirst={activeProjects.length > 0}
          />
        </Panel>

        <Panel title="Upcoming deadlines" subtitle="Milestones and due dates will appear here.">
          <div className="grid min-h-[150px] place-items-center rounded-[0.9rem] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center">
            <div className="max-w-sm">
              <CalendarDays className="mx-auto size-6 text-[#94A3B8]" />
              <h3 className="mt-3 text-sm font-semibold text-[#334155]">
                No deadlines scheduled
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Add dates to projects and tasks to build your timeline.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ErrorPanel({ message, title }: { message: string; title: string }) {
  return (
    <div className="rounded-[0.9rem] border border-[#FECACA] bg-[#FEF2F2] p-4">
      <p className="text-sm font-semibold text-[#DC2626]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#7F1D1D]">{message}</p>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
  tone: "blue" | "indigo" | "amber" | "green";
};

const metricToneClass = {
  blue: "bg-[#EEF6FF] text-[#2563EB]",
  indigo: "bg-[#EEF2FF] text-[#4F46E5]",
  amber: "bg-[#FFFBEB] text-[#D97706]",
  green: "bg-[#ECFDF5] text-[#059669]",
};

function MetricCard({ label, value, detail, icon: Icon, tone }: MetricCardProps) {
  return (
    <article className="rounded-[0.9rem] bg-[#FBFCFE] p-3.5 ring-1 ring-[#EEF2F7]">
      <div className="flex items-center gap-3">
        <span
          className={`grid size-8 place-items-center rounded-[0.7rem] ${metricToneClass[tone]}`}
        >
          <Icon className="size-3.5" />
        </span>
        <p className="text-[0.82rem] font-semibold text-[#334155]">{label}</p>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-[0.82rem] text-[#64748B]">{detail}</p>
    </article>
  );
}

function Panel({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-6 rounded-[1rem] bg-white p-4"
    >
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-[#64748B]">{subtitle}</p>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyRows({
  rows,
  completedFirst = false,
}: {
  rows: string[];
  completedFirst?: boolean;
}) {
  return (
    <div className="divide-y divide-[#F1F5F9] rounded-[0.9rem] ring-1 ring-[#EEF2F7]">
      {rows.map((row, index) => {
        const done = completedFirst && index === 0;
        const Icon = done ? CheckCircle2 : Circle;

        return (
          <div key={row} className="flex items-center gap-3 px-4 py-2.5">
            <Icon
              className={`size-4 ${done ? "text-[#059669]" : "text-[#94A3B8]"}`}
            />
            <p
              className={`text-sm ${
                done ? "font-medium text-[#334155]" : "text-[#64748B]"
              }`}
            >
              {row}
            </p>
          </div>
        );
      })}
    </div>
  );
}
