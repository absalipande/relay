import { Button } from "@/components/ui/button";
import type { ComponentType, ReactNode } from "react";
import {
  Activity,
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

  return <WorkspaceDashboard workspace={activeWorkspace} />;
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
  workspace: WorkspaceListProps["workspaces"][number];
};

function WorkspaceDashboard({ workspace }: WorkspaceDashboardProps) {
  const createdAt = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(workspace.created_at));

  return (
    <div className="space-y-5">
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
          <Button className="h-9 rounded-[0.8rem] bg-[#007AFF] px-4 text-white hover:bg-[#006be0]">
            <Plus className="size-4" />
            New project
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          label="Active projects"
          value="0"
          detail="Ready for your first project"
          icon={FolderKanban}
          tone="blue"
        />
        <MetricCard
          label="Open tasks"
          value="0"
          detail="Tasks appear after projects"
          icon={ListTodo}
          tone="indigo"
        />
        <MetricCard
          label="Due soon"
          value="0"
          detail="No deadlines yet"
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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_0.95fr]">
        <Panel title="Project momentum" subtitle="Track work once projects exist.">
          <div className="grid min-h-[250px] place-items-center rounded-[0.9rem] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-6 text-center">
            <div className="max-w-sm">
              <Activity className="mx-auto size-7 text-[#94A3B8]" />
              <h3 className="mt-4 text-sm font-semibold text-[#334155]">
                No project activity yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Create a project to start tracking tasks, updates, and progress.
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="My tasks" subtitle="Your assigned work will appear here.">
          <EmptyRows
            rows={[
              "Create a project",
              "Add the first task",
              "Invite a teammate",
              "Set a deadline",
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_0.95fr]">
        <Panel title="Recent activity" subtitle="Workspace updates will collect here.">
          <EmptyRows
            rows={[
              `Workspace created on ${createdAt}`,
              "Project updates will appear here",
              "Task comments will appear here",
            ]}
            completedFirst
          />
        </Panel>

        <Panel title="Upcoming deadlines" subtitle="Milestones and due dates will appear here.">
          <div className="grid min-h-[210px] place-items-center rounded-[0.9rem] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-6 text-center">
            <div className="max-w-sm">
              <CalendarDays className="mx-auto size-7 text-[#94A3B8]" />
              <h3 className="mt-4 text-sm font-semibold text-[#334155]">
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
    <article className="rounded-[1rem] border border-[#E4E4E7] bg-white p-5">
      <div className="flex items-center gap-3">
        <span
          className={`grid size-9 place-items-center rounded-[0.8rem] ${metricToneClass[tone]}`}
        >
          <Icon className="size-4" />
        </span>
        <p className="text-sm font-semibold text-[#334155]">{label}</p>
      </div>
      <p className="mt-7 text-4xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-[#64748B]">{detail}</p>
    </article>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1rem] border border-[#E4E4E7] bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-[#64748B]">{subtitle}</p>
      </div>
      <div className="mt-5">{children}</div>
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
    <div className="divide-y divide-[#F1F5F9] rounded-[0.9rem] border border-[#E4E4E7]">
      {rows.map((row, index) => {
        const done = completedFirst && index === 0;
        const Icon = done ? CheckCircle2 : Circle;

        return (
          <div key={row} className="flex items-center gap-3 px-4 py-3">
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
