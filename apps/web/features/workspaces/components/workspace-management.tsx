"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  FolderKanban,
  FolderPlus,
  Grid2X2,
  List,
  Loader2,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  forwardRef,
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProjectCreateDialog as ExistingProjectCreateDialog } from "@/features/projects/components/project-create-dialog";
import { WorkspaceCreateForm } from "@/features/workspaces/components/workspace-create-form";
import {
  deleteWorkspace,
  markWorkspaceOpened,
  updateWorkspaceIdentity,
  type DeleteWorkspaceState,
} from "@/features/workspaces/actions";
import type { ApiWorkspace } from "@/lib/api/server";

const workspaceIconColors = ["#007AFF", "#4F46E5", "#F97316", "#22C55E", "#DB2777"] as const;

type WorkspaceManagementProps = {
  currentUser: {
    email: string;
    name: string;
  };
  error?: string;
  initialPanelMode: "details" | "ai" | "create";
  initialWorkspaceId?: string;
  projectCounts: Record<string, number>;
  workspaces: ApiWorkspace[];
};

export function WorkspaceManagement({
  currentUser,
  error,
  initialPanelMode,
  initialWorkspaceId,
  projectCounts,
  workspaces,
}: WorkspaceManagementProps) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(initialWorkspaceId);
  const [panelMode, setPanelMode] = useState<"details" | "ai">(
    initialPanelMode === "ai" ? "ai" : "details",
  );
  const [panelIntent, setPanelIntent] = useState<"idle" | "create">(
    initialPanelMode === "create" ? "create" : "idle",
  );
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<"newest" | "oldest">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [openedAtByWorkspaceId, setOpenedAtByWorkspaceId] = useState<Record<string, string>>({});
  const selectedWorkspace = useMemo(() => {
    const workspace = selectedWorkspaceId
      ? workspaces.find((item) => item.id === selectedWorkspaceId)
      : undefined;

    if (!workspace) return undefined;

    return {
      ...workspace,
      last_opened_at: openedAtByWorkspaceId[workspace.id] ?? workspace.last_opened_at,
    };
  }, [openedAtByWorkspaceId, selectedWorkspaceId, workspaces]);
  const filteredWorkspaces = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const matches = !needle
      ? workspaces
      : workspaces.filter(
          (workspace) =>
            workspace.name.toLowerCase().includes(needle) ||
            workspace.slug.toLowerCase().includes(needle),
        );

    return [...matches].sort((left, right) => {
      const leftCreatedAt = new Date(left.created_at).getTime();
      const rightCreatedAt = new Date(right.created_at).getTime();

      return sortMode === "newest"
        ? rightCreatedAt - leftCreatedAt
        : leftCreatedAt - rightCreatedAt;
    });
  }, [query, sortMode, workspaces]);
  const hasWorkspaces = workspaces.length > 0;
  const isFirstWorkspace = !hasWorkspaces && !error;

  function selectWorkspace(workspaceId: string) {
    void markWorkspaceOpened(workspaceId).then((result) => {
      const updatedAt = result.updatedAt;

      if (updatedAt) {
        setOpenedAtByWorkspaceId((current) => ({
          ...current,
          [workspaceId]: updatedAt,
        }));
      }
    });
    setSelectedWorkspaceId(workspaceId);
    setPanelMode("details");
    setPanelIntent("idle");
    window.history.replaceState(null, "", `/app/workspaces?workspace=${workspaceId}&panel=details`);
  }

  function changePanelMode(mode: "details" | "ai") {
    if (!selectedWorkspaceId) return;

    setPanelMode(mode);
    setPanelIntent("idle");
    window.history.replaceState(
      null,
      "",
      `/app/workspaces?workspace=${selectedWorkspaceId}&panel=${mode}`,
    );
  }

  function openCreatePanel() {
    setSelectedWorkspaceId(undefined);
    setPanelMode("details");
    setPanelIntent("create");
    window.history.replaceState(null, "", "/app/workspaces?panel=create");
  }

  function closePanel() {
    setSelectedWorkspaceId(undefined);
    setPanelMode("details");
    setPanelIntent("idle");
    window.history.replaceState(null, "", "/app/workspaces");
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0">
        <div className="shrink-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold leading-tight tracking-[-0.01em] text-[#111111]">
                Workspaces
              </h1>
              <p className="mt-1 max-w-2xl text-[0.76rem] leading-5 text-[#71717A]">
                {isFirstWorkspace
                  ? "Create your first workspace to start organizing projects, tasks, files, and members."
                  : "Switch between the spaces you own, or create a new one for a team or project."}
              </p>
            </div>
            {hasWorkspaces ? (
              <Button
                type="button"
                onClick={openCreatePanel}
                className="h-8 rounded-[0.62rem] bg-[#007AFF] px-3 text-[0.76rem] font-semibold text-white hover:bg-[#006be0]"
              >
                New workspace
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          {hasWorkspaces ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Label className="relative block w-[300px] max-w-full">
                <span className="sr-only">Search workspaces</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search workspaces..."
                  className="h-8 rounded-[0.6rem] border-[#E4E4E7] bg-white pl-8 text-[0.76rem] shadow-none placeholder:text-[#8A8A8E] focus-visible:border-[#007AFF]/35 focus-visible:ring-1 focus-visible:ring-[#007AFF]/10"
                />
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-8 items-center rounded-[0.6rem] border border-[#E4E4E7] bg-white p-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSortMode("newest")}
                    className={`h-7 rounded-[0.48rem] px-2.5 text-[0.72rem] font-semibold ${
                      sortMode === "newest"
                        ? "bg-[#EFF6FF] text-[#007AFF] hover:bg-[#EFF6FF]"
                        : "text-[#64748B] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    Newest
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSortMode("oldest")}
                    className={`h-7 rounded-[0.48rem] px-2.5 text-[0.72rem] font-semibold ${
                      sortMode === "oldest"
                        ? "bg-[#EFF6FF] text-[#007AFF] hover:bg-[#EFF6FF]"
                        : "text-[#64748B] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    Oldest
                  </Button>
                </div>
                <div className="flex h-8 items-center rounded-[0.6rem] border border-[#E4E4E7] bg-white p-0.5">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setViewMode("grid")}
                    className={`size-7 rounded-[0.48rem] ${
                      viewMode === "grid"
                        ? "bg-[#EFF6FF] text-[#007AFF] hover:bg-[#EFF6FF]"
                        : "text-[#64748B] hover:bg-[#F8FAFC]"
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid2X2 className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setViewMode("list")}
                    className={`size-7 rounded-[0.48rem] ${
                      viewMode === "list"
                        ? "bg-[#EFF6FF] text-[#007AFF] hover:bg-[#EFF6FF]"
                        : "text-[#64748B] hover:bg-[#F8FAFC]"
                    }`}
                    aria-label="List view"
                  >
                    <List className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-[0.8rem] bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div
            className={`app-content-scrollbar mt-4 overflow-y-auto overflow-x-hidden pr-1 ${
              hasWorkspaces ? "max-h-[calc(100dvh-15rem)]" : "min-h-[320px]"
            }`}
          >
            <div
              className={`grid gap-4 ${
                !hasWorkspaces
                  ? "min-h-[320px] place-items-center"
                  : viewMode === "grid"
                    ? "md:grid-cols-2 2xl:grid-cols-3"
                    : "grid-cols-1"
              }`}
            >
              {filteredWorkspaces.length > 0 ? (
                filteredWorkspaces.map((workspace) => (
                  <WorkspaceCard
                    key={workspace.id}
                    onSelect={() => selectWorkspace(workspace.id)}
                    projectCount={projectCounts[workspace.id] ?? 0}
                    selected={workspace.id === selectedWorkspace?.id}
                    workspace={workspace}
                    viewMode={viewMode}
                  />
                ))
              ) : workspaces.length === 0 ? (
                <div className="col-span-full mx-auto grid max-w-[360px] place-items-center text-center">
                  <span className="grid size-14 place-items-center rounded-[1rem] bg-[#EFF6FF] text-[#007AFF] ring-1 ring-[#DBEAFE]">
                    <FolderPlus className="size-6" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold tracking-[-0.01em] text-[#111111]">
                    No workspaces yet
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#64748B]">
                    Use the form on the right to create your first workspace for a team, client,
                    department, or personal project.
                  </p>
                </div>
              ) : (
                <div className="grid min-h-[260px] place-items-center rounded-[1.15rem] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-6 py-10 text-center">
                  <div className="max-w-[360px]">
                    <span className="mx-auto grid size-14 place-items-center rounded-[1rem] bg-white text-[#007AFF] shadow-[0_18px_54px_-42px_rgba(15,23,42,0.5)] ring-1 ring-[#DBEAFE]">
                      <FolderPlus className="size-7" />
                    </span>
                    <h3 className="mt-5 text-base font-semibold tracking-[-0.01em] text-[#111111]">
                      No matching workspaces
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-[#64748B]">
                      Try another name or URL.
                    </p>
                  </div>
                </div>
              )}
            </div>
            {filteredWorkspaces.length > 1 ? (
              <p className="py-5 text-center text-xs font-medium text-[#94A3B8]">
                You&apos;ve reached the end.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="sticky top-3 min-h-[320px]">
        <div className="rounded-[0.85rem] bg-white p-3">
          {selectedWorkspace ? (
            <WorkspaceInspector
              currentUser={currentUser}
              mode={panelMode}
              onClose={closePanel}
              onModeChange={changePanelMode}
              projectCount={projectCounts[selectedWorkspace.id] ?? 0}
              workspace={selectedWorkspace}
            />
          ) : panelIntent === "create" || isFirstWorkspace ? (
            <>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-[-0.01em]">
                    {isFirstWorkspace ? "Create your first workspace" : "Create workspace"}
                  </h2>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {isFirstWorkspace
                      ? "Create a space for your team, client, department, or personal project."
                      : "Choose a name and URL. You will start as the workspace owner."}
                  </p>
                </div>
                {isFirstWorkspace ? null : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={closePanel}
                    className="size-8 rounded-[0.7rem] text-[#71717A]"
                    aria-label="Close create workspace panel"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
              <WorkspaceCreateForm compact redirectTo="/app/workspaces" />
            </>
          ) : (
            <div className="grid min-h-[318px] place-items-center text-center">
              <div>
                <span className="mx-auto grid size-12 place-items-center rounded-[0.9rem] bg-[#EFF6FF] text-[#007AFF]">
                  <Grid2X2 className="size-5" />
                </span>
                <h2 className="mt-4 text-base font-semibold">Workspace details</h2>
                <p className="mx-auto mt-2 max-w-[240px] text-xs leading-5 text-slate-500">
                  Select a workspace to view details, or use New workspace to create another one.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function WorkspaceCard({
  onSelect,
  projectCount,
  selected,
  workspace,
  viewMode,
}: {
  onSelect: () => void;
  projectCount: number;
  selected: boolean;
  workspace: ApiWorkspace;
  viewMode: "grid" | "list";
}) {
  if (viewMode === "list") {
    return (
      <article
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
          }
        }}
        className={`group relative grid cursor-pointer gap-3 rounded-[0.75rem] border bg-white p-3 transition-colors hover:border-[#D4D4D8] hover:bg-[#FAFAFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD] md:grid-cols-[minmax(0,1fr)_auto] md:items-center ${
          selected ? "border-[#93C5FD] bg-[#FBFDFF] ring-1 ring-[#BFDBFE]" : "border-[#E4E4E7]"
        }`}
      >
        <span
          className={`absolute left-0 top-3 hidden h-[calc(100%-1.5rem)] w-1 rounded-r-full md:block ${
            selected ? "bg-[#2563EB]" : "bg-transparent group-hover:bg-[#BFDBFE]"
          }`}
        />

        <div className="flex min-w-0 items-center gap-3 pl-0 md:pl-2">
          <WorkspaceMark
            color={workspace.icon_color}
            initials={workspace.icon_initials}
            name={workspace.name}
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className="truncate text-[0.82rem] font-semibold text-[#111827]">
                {workspace.name}
              </h3>
              {selected ? <CurrentBadge /> : null}
            </div>
            <p className="mt-0.5 truncate text-[0.72rem] font-medium text-[#64748B]">
              /{workspace.slug}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="flex items-center gap-4 text-[0.74rem] font-medium text-[#64748B]">
            <span className="flex items-center gap-2">
              <Users className="size-4" />1 member
            </span>
            <span className="text-[#CBD5E1]">·</span>
            <span className="flex items-center gap-2">
              <FolderKanban className="size-4" />
              {formatCount(projectCount, "project")}
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`rounded-[0.75rem] border bg-white p-3 transition-colors hover:border-[#D4D4D8] hover:bg-[#FAFAFA] ${
        selected ? "border-[#93C5FD] ring-1 ring-[#BFDBFE]" : "border-[#E4E4E7]"
      } cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD]`}
    >
      <div className="flex min-w-0 items-start gap-3 text-left">
        <WorkspaceMark
          color={workspace.icon_color}
          initials={workspace.icon_initials}
          name={workspace.name}
        />
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[0.82rem] font-semibold text-[#111827]">
              {workspace.name}
            </span>
            {selected ? <CurrentBadge /> : null}
          </span>
          <span className="mt-0.5 block truncate text-[0.72rem] font-medium text-[#64748B]">
            /{workspace.slug}
          </span>
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4 text-[0.74rem] font-medium text-[#64748B]">
        <span className="flex items-center gap-2">
          <Users className="size-4" />1 member
        </span>
        <span>·</span>
        <span className="flex items-center gap-2">
          <FolderKanban className="size-4" />
          {formatCount(projectCount, "project")}
        </span>
      </div>
    </article>
  );
}

function CurrentBadge() {
  return (
    <span className="shrink-0 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[0.68rem] font-semibold text-[#2563EB]">
      Current
    </span>
  );
}

function WorkspaceMark({
  color,
  initials,
  name,
}: {
  color?: string | null;
  initials?: string | null;
  name: string;
}) {
  return (
    <span
      className="grid size-9 shrink-0 place-items-center rounded-[0.65rem] text-xs font-semibold text-white"
      style={{ backgroundColor: color ?? getWorkspaceColor(name) }}
    >
      {initials ?? getWorkspaceInitials(name)}
    </span>
  );
}

function WorkspaceInspector({
  currentUser,
  onClose,
  projectCount,
  workspace,
}: {
  currentUser: {
    email: string;
    name: string;
  };
  mode: "details" | "ai";
  onClose: () => void;
  onModeChange: (mode: "details" | "ai") => void;
  projectCount: number;
  workspace: ApiWorkspace;
}) {
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [lastOpenedAt, setLastOpenedAt] = useState(workspace.last_opened_at);
  const [lastOpened, setLastOpened] = useState(() =>
    getRelativeWorkspaceTime(workspace.last_opened_at),
  );

  useEffect(() => {
    setLastOpenedAt(workspace.last_opened_at);
  }, [workspace.id, workspace.last_opened_at]);

  useEffect(() => {
    setLastOpened(getRelativeWorkspaceTime(lastOpenedAt));

    const interval = window.setInterval(() => {
      setLastOpened(getRelativeWorkspaceTime(lastOpenedAt));
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [lastOpenedAt]);

  useEffect(() => {
    if (!copiedSlug) return;

    const timeout = window.setTimeout(() => {
      setCopiedSlug(false);
    }, 1600);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [copiedSlug]);

  async function copyWorkspaceSlug() {
    const value = `/${workspace.slug}`;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedSlug(true);
    } catch {
      setCopiedSlug(false);
    }
  }

  function openWorkspace() {
    void markWorkspaceOpened(workspace.id).then((result) => {
      if (result.updatedAt) {
        setLastOpenedAt(result.updatedAt);
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <WorkspaceMark
            color={workspace.icon_color}
            initials={workspace.icon_initials}
            name={workspace.name}
          />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold tracking-[-0.01em]">{workspace.name}</h2>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#22C55E]">
              <span className="size-1.5 rounded-full bg-[#22C55E]" />
              Current workspace
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 truncate text-xs font-medium text-slate-500">
              <span className="truncate">/{workspace.slug}</span>
              <button
                type="button"
                onClick={copyWorkspaceSlug}
                className="grid size-5 shrink-0 place-items-center rounded-[0.35rem] text-[#94A3B8] transition-colors hover:bg-[#F4F4F5] hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/20"
                aria-label={copiedSlug ? "Workspace URL copied" : "Copy workspace URL"}
                title={copiedSlug ? "Copied" : "Copy workspace URL"}
              >
                {copiedSlug ? (
                  <Check className="size-3.5 text-[#16A34A]" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="size-8 rounded-[0.7rem] text-[#71717A]"
          aria-label="Close workspace panel"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="mt-5 space-y-5">
        <div className="rounded-[0.75rem] border border-[#E4E4E7] bg-white px-3">
          <ContextRow icon={Users} label="Your role" value={capitalize(workspace.role)} />
          <ContextRow icon={Users} label="Members" value="1" />
          <ContextRow icon={FolderKanban} label="Projects" value={`${projectCount}`} />
          <ContextRow
            icon={CalendarDays}
            label="Created"
            value={formatDate(workspace.created_at)}
          />
          <ContextRow icon={Clock3} label="Last opened" value={lastOpened} />
        </div>

        <div>
          <h3 className="text-sm font-semibold">About this workspace</h3>
          <p className="mt-2 text-xs leading-5 text-[#64748B]">
            This is your current workspace. Manage projects, tasks, and collaborate with your team.
          </p>
        </div>

        <Button
          asChild
          className="h-8 w-full rounded-[0.62rem] bg-[#007AFF] text-[0.76rem] font-semibold text-white hover:bg-[#006be0]"
        >
          <a href={`/app?workspace=${workspace.id}`} onClick={openWorkspace}>
            Open workspace
            <ExternalLink className="size-4" />
          </a>
        </Button>

        <div className="space-y-3">
          <WorkspaceEditDialog currentUser={currentUser} workspace={workspace}>
            <InspectorAction icon={Settings} label="Workspace settings" />
          </WorkspaceEditDialog>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Manage</h3>
          <div className="mt-2 space-y-2">
            <InspectorAction
              disabled
              icon={Users}
              label="Invite members"
              title="Invites are not available yet"
            />
            <ExistingProjectCreateDialog workspaceId={workspace.id} workspaceName={workspace.name}>
              <InspectorAction icon={FolderPlus} label="Create project" />
            </ExistingProjectCreateDialog>
            <WorkspaceDeleteDialog workspace={workspace}>
              <InspectorAction destructive icon={Trash2} label="Delete workspace" />
            </WorkspaceDeleteDialog>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkspaceEditDialog({
  children,
  currentUser,
  workspace,
}: {
  children: ReactNode;
  currentUser?: {
    email: string;
    name: string;
  };
  workspace: ApiWorkspace;
}) {
  const canEdit = workspace.role === "owner" || workspace.role === "admin";

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden rounded-[1rem] p-0 sm:max-w-none md:w-[860px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Workspace settings</DialogTitle>
          <DialogDescription>Manage access and workspace identity.</DialogDescription>
        </DialogHeader>
        <WorkspaceSettingsPanel
          canEdit={canEdit}
          currentUser={
            currentUser ?? {
              email: "Unknown email",
              name: "Current user",
            }
          }
          workspace={workspace}
        />
      </DialogContent>
    </Dialog>
  );
}

function WorkspaceSettingsPanel({
  canEdit,
  currentUser,
  workspace,
}: {
  canEdit: boolean;
  currentUser: {
    email: string;
    name: string;
  };
  workspace: ApiWorkspace;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(workspace.name);
  const [slug, setSlug] = useState(workspace.slug);
  const [iconInitials, setIconInitials] = useState(
    workspace.icon_initials ?? getWorkspaceInitials(workspace.name),
  );
  const [iconColor, setIconColor] = useState(
    workspace.icon_color ?? getWorkspaceColor(workspace.name),
  );
  const [lastSavedName, setLastSavedName] = useState(workspace.name);
  const [lastSavedSlug, setLastSavedSlug] = useState(workspace.slug);
  const [lastSavedIconInitials, setLastSavedIconInitials] = useState(iconInitials);
  const [lastSavedIconColor, setLastSavedIconColor] = useState(iconColor);
  const [error, setError] = useState<string | null>(null);
  const [recentlySaved, setRecentlySaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!canEdit) return;

    const nextName = name.trim();
    const nextSlug = slug.trim();
    const nextIconInitials = iconInitials.trim().toUpperCase();
    const nextIconColor = iconColor;
    if (
      nextName === lastSavedName &&
      nextSlug === lastSavedSlug &&
      nextIconInitials === lastSavedIconInitials &&
      nextIconColor === lastSavedIconColor
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      startTransition(async () => {
        const result = await updateWorkspaceIdentity(
          workspace.id,
          nextName,
          nextSlug,
          nextIconInitials,
          nextIconColor,
        );

        if (result.message) {
          setError(
            result.fieldErrors?.name?.[0] ??
              result.fieldErrors?.slug?.[0] ??
              result.fieldErrors?.icon_initials?.[0] ??
              result.fieldErrors?.icon_color?.[0] ??
              result.message,
          );
          return;
        }

        setError(null);
        setLastSavedName(nextName);
        setLastSavedSlug(nextSlug);
        setLastSavedIconInitials(nextIconInitials);
        setLastSavedIconColor(nextIconColor);
        setRecentlySaved(true);
        router.refresh();
      });
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [
    canEdit,
    iconColor,
    iconInitials,
    lastSavedIconColor,
    lastSavedIconInitials,
    lastSavedName,
    lastSavedSlug,
    name,
    router,
    slug,
    workspace.id,
  ]);

  useEffect(() => {
    if (!recentlySaved) return;

    const timeout = window.setTimeout(() => setRecentlySaved(false), 1200);

    return () => window.clearTimeout(timeout);
  }, [recentlySaved]);

  const statusLabel = isPending ? "Saving..." : recentlySaved ? "Saved" : null;
  const workspaceUrl = `relay.app/${slug}`;

  async function copyWorkspaceUrl() {
    await navigator.clipboard.writeText(workspaceUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="flex max-h-[76vh] min-h-[520px] flex-col bg-white">
      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,0.92fr)_1px_minmax(340px,0.9fr)]">
        <aside className="min-h-0 overflow-y-auto p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-[#111827]">
              Workspace settings
            </h2>
          </div>

          <div className="mt-9 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#111827]">Members</h3>
              <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs font-semibold text-[#64748B]">
                1
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-[0.75rem] border-[#E4E4E7] bg-white px-3 text-xs font-semibold"
            >
              <UserPlus className="size-3.5" />
              Invite
            </Button>
          </div>

          <Label className="relative mt-5 block">
            <span className="sr-only">Search members</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              placeholder="Search members..."
              className="h-10 rounded-[0.75rem] border-[#E4E4E7] bg-white pl-10 text-xs shadow-none"
            />
          </Label>

          <div className="mt-5 rounded-[0.9rem] bg-[#F8FAFC] p-3.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#030712] text-xs font-semibold text-white">
                  {getWorkspaceInitials(currentUser.name).slice(0, 1)}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-xs font-semibold text-[#111827]">
                    <span className="truncate">{currentUser.name}</span>
                    <span className="rounded-full bg-[#EEF2FF] px-1.5 py-0.5 text-[11px] font-semibold text-[#2563EB]">
                      You
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-[#64748B]">{currentUser.email}</span>
                </span>
              </div>
              <button
                type="button"
                className="flex shrink-0 items-center gap-1.5 rounded-[0.65rem] px-2 py-1 text-xs font-semibold capitalize text-[#334155] hover:bg-white"
              >
                {workspace.role}
                <ChevronDown className="size-3.5 text-[#64748B]" />
              </button>
            </div>
          </div>
        </aside>

        <div className="hidden bg-[#E4E4E7] md:block" />

        <section className="min-h-0 overflow-y-auto p-6">
          <div className="flex items-start gap-4">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-[0.75rem] text-base font-semibold text-white"
              style={{ backgroundColor: iconColor }}
            >
              {iconInitials}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold tracking-tight text-[#111827]">
                {name}
              </h3>
              <div className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-[#22C55E]">
                <span className="size-1.5 rounded-full bg-[#22C55E]" />
                Current workspace
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 truncate text-xs font-medium text-[#64748B]">
                /{slug}
                <button
                  type="button"
                  onClick={copyWorkspaceUrl}
                  className="rounded-[0.4rem] p-1 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#334155]"
                  aria-label="Copy workspace URL"
                >
                  <Copy className="size-3.5 shrink-0" />
                </button>
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-[#E4E4E7] pt-5">
            <h4 className="text-xs font-semibold text-[#111827]">General</h4>

            <div className="mt-5 space-y-5">
              <div>
                <Label
                  htmlFor={`workspace-name-${workspace.id}`}
                  className="text-xs font-semibold text-[#334155]"
                >
                  Workspace name
                </Label>
                <div className="mt-2 flex h-10 items-center rounded-[0.75rem] border border-[#E4E4E7] bg-white focus-within:border-[#007AFF]/45 focus-within:ring-2 focus-within:ring-[#007AFF]/12">
                  <Input
                    id={`workspace-name-${workspace.id}`}
                    name="name"
                    value={name}
                    disabled={!canEdit}
                    onChange={(event) => {
                      setName(event.target.value);
                      setSlug(slugifyWorkspaceName(event.target.value));
                      setIconInitials(getWorkspaceInitials(event.target.value));
                    }}
                    aria-invalid={Boolean(error)}
                    className="h-9 flex-1 border-0 bg-transparent text-xs shadow-none focus-visible:ring-0"
                  />
                  {statusLabel ? (
                    <span className="mr-3 flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#64748B]">
                      {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                      {statusLabel}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-[#64748B]">This is the name of your workspace.</p>
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#334155]">Workspace URL</Label>
                <div className="mt-2 flex h-10 overflow-hidden rounded-[0.75rem] border border-[#E4E4E7] bg-white">
                  <span className="grid shrink-0 place-items-center bg-[#F8FAFC] px-3 text-xs font-semibold text-[#64748B]">
                    relay.app/
                  </span>
                  <span className="flex min-w-0 flex-1 items-center px-3 text-xs font-semibold text-[#334155]">
                    {slug}
                  </span>
                  {copied ? (
                    <span className="mr-3 flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#64748B]">
                      Copied
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-[#64748B]">
                  This is your workspace&apos;s unique URL.
                </p>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-[#334155]">Workspace icon</h5>
                <div className="mt-3 flex items-center gap-3">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-[0.7rem] text-sm font-semibold text-white"
                    style={{ backgroundColor: iconColor }}
                  >
                    {iconInitials}
                  </span>
                  <Input
                    value={iconInitials}
                    disabled={!canEdit}
                    maxLength={3}
                    onChange={(event) => {
                      setIconInitials(event.target.value.replace(/[^a-z0-9]/gi, "").toUpperCase());
                    }}
                    aria-label="Workspace icon initials"
                    className="h-9 w-20 rounded-[0.7rem] border-[#E4E4E7] bg-white text-center text-xs font-semibold uppercase shadow-none focus-visible:ring-1 focus-visible:ring-[#007AFF]/15"
                  />
                  <div className="flex items-center gap-1.5">
                    {workspaceIconColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => setIconColor(color)}
                        className={`size-6 rounded-full ring-offset-2 transition ${
                          iconColor === color ? "ring-2 ring-[#111111]" : "ring-1 ring-black/10"
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Use ${color} as workspace icon color`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-xs text-[#64748B]">
                  Use initials and a color for a clean workspace mark.
                </p>
              </div>

              {error ? (
                <p className="rounded-[0.8rem] bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-[#E4E4E7] px-6 py-4">
        <p className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
          <ShieldCheck className="size-3.5" />
          Only workspace owners can change these settings.
        </p>
        <div className="flex items-center gap-3">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 min-w-28 rounded-[0.75rem] border-[#E4E4E7] text-xs font-semibold"
            >
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="button"
              className="h-10 min-w-32 rounded-[0.75rem] bg-[#007AFF] text-xs font-semibold text-white hover:bg-[#4338CA]"
            >
              Done
            </Button>
          </DialogClose>
        </div>
      </footer>
    </div>
  );
}

const deleteInitialState: DeleteWorkspaceState = {
  message: null,
};

function WorkspaceDeleteDialog({
  children,
  workspace,
}: {
  children: ReactNode;
  workspace: ApiWorkspace;
}) {
  const canDelete = workspace.role === "owner";
  const [state, formAction] = useActionState(deleteWorkspace, deleteInitialState);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {workspace.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Projects, tasks, files, members, and workspace settings
            tied to this workspace will be removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {state.message ? (
          <p className="rounded-[0.8rem] bg-red-50 px-3 py-2 text-xs text-red-700">
            {state.message}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={formAction}>
            <input type="hidden" name="workspaceId" value={workspace.id} />
            <DeleteWorkspaceButton disabled={!canDelete} />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteWorkspaceButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="destructive" disabled={disabled || pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Deleting
        </>
      ) : (
        "Delete workspace"
      )}
    </Button>
  );
}

type InspectorActionProps = ComponentPropsWithoutRef<typeof Button> & {
  destructive?: boolean;
  icon: ComponentType<{ className?: string }>;
  label: string;
};

const InspectorAction = forwardRef<HTMLButtonElement, InspectorActionProps>(
  function InspectorAction(
    { destructive = false, icon: Icon, label, className = "", ...props },
    ref,
  ) {
    const disabled = props.disabled;

    return (
      <Button
        ref={ref}
        type="button"
        variant="outline"
        className={`h-9 w-full justify-between rounded-[0.65rem] border-[#E4E4E7] px-3 text-[0.8rem] ${
          disabled
            ? "cursor-not-allowed bg-[#FAFAFA] text-[#A1A1AA] opacity-70 hover:bg-[#FAFAFA] hover:text-[#A1A1AA]"
            : destructive
              ? "text-red-600 hover:bg-red-50 hover:text-red-700"
              : "bg-white text-[#334155] hover:bg-[#F4F4F5]"
        } ${className}`}
        {...props}
      >
        <span className="flex items-center gap-2">
          <Icon className={disabled ? "size-3.5 text-[#A1A1AA]" : "size-3.5"} />
          {label}
        </span>
        <ChevronRight className={`size-3.5 ${disabled ? "text-[#D4D4D8]" : "text-[#94A3B8]"}`} />
      </Button>
    );
  },
);

function ContextRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#EEF2F7] py-2.5 last:border-b-0">
      <span className="flex items-center gap-2 text-xs text-slate-500">
        <Icon className="size-3.5 text-[#64748B]" />
        {label}
      </span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}

function getWorkspaceInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return initials.toUpperCase() || "WS";
}

function getWorkspaceColor(name: string) {
  const index = [...name].reduce((sum, character) => {
    return sum + character.charCodeAt(0);
  }, 0);

  return workspaceIconColors[index % workspaceIconColors.length];
}

function getRelativeWorkspaceTime(value: string | null) {
  if (!value) return "Never";

  const timestamp = new Date(value).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - timestamp);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 31) return `${Math.floor(diffDays / 7)} weeks ago`;

  return formatDate(value);
}

function formatCount(value: number, noun: string) {
  return `${value} ${noun}${value === 1 ? "" : "s"}`;
}

function slugifyWorkspaceName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
