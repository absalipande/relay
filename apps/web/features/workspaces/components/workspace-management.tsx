"use client";

import {
  Bot,
  CalendarDays,
  CheckCircle2,
  Edit3,
  FolderKanban,
  Grid2X2,
  List,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
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
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkspaceCreateForm } from "@/features/workspaces/components/workspace-create-form";
import {
  deleteWorkspace,
  updateWorkspace,
  type DeleteWorkspaceState,
  type WorkspaceFormState,
} from "@/features/workspaces/actions";
import type { ApiWorkspace } from "@/lib/api/server";

type WorkspaceManagementProps = {
  error?: string;
  initialPanelMode: "details" | "ai" | "create";
  initialWorkspaceId?: string;
  workspaces: ApiWorkspace[];
};

export function WorkspaceManagement({
  error,
  initialPanelMode,
  initialWorkspaceId,
  workspaces,
}: WorkspaceManagementProps) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(
    initialWorkspaceId,
  );
  const [panelMode, setPanelMode] = useState<"details" | "ai">(
    initialPanelMode === "ai" ? "ai" : "details",
  );
  const [panelIntent, setPanelIntent] = useState<"idle" | "create">(
    initialPanelMode === "create" ? "create" : "idle",
  );
  const [query, setQuery] = useState("");
  const selectedWorkspace = useMemo(
    () =>
      selectedWorkspaceId
        ? workspaces.find((workspace) => workspace.id === selectedWorkspaceId)
        : undefined,
    [selectedWorkspaceId, workspaces],
  );
  const filteredWorkspaces = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) return workspaces;

    return workspaces.filter(
      (workspace) =>
        workspace.name.toLowerCase().includes(needle) ||
        workspace.slug.toLowerCase().includes(needle),
    );
  }, [query, workspaces]);

  function selectWorkspace(workspaceId: string) {
    setSelectedWorkspaceId(workspaceId);
    setPanelMode("details");
    setPanelIntent("idle");
    window.history.replaceState(
      null,
      "",
      `/app/workspaces/new?workspace=${workspaceId}&panel=details`,
    );
  }

  function changePanelMode(mode: "details" | "ai") {
    if (!selectedWorkspaceId) return;

    setPanelMode(mode);
    setPanelIntent("idle");
    window.history.replaceState(
      null,
      "",
      `/app/workspaces/new?workspace=${selectedWorkspaceId}&panel=${mode}`,
    );
  }

  function openCreatePanel() {
    setSelectedWorkspaceId(undefined);
    setPanelMode("details");
    setPanelIntent("create");
    window.history.replaceState(null, "", "/app/workspaces/new?panel=create");
  }

  function closePanel() {
    setSelectedWorkspaceId(undefined);
    setPanelMode("details");
    setPanelIntent("idle");
    window.history.replaceState(null, "", "/app/workspaces/new");
  }

  return (
    <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-semibold leading-tight tracking-tight">
              Manage workspaces
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64748B]">
              Create, switch, and organize the team spaces you use in Relay.
            </p>
          </div>
          <Button
            type="button"
            onClick={openCreatePanel}
            className="h-10 rounded-[0.8rem] bg-[#007AFF] px-4 text-white hover:bg-[#006be0]"
          >
            <Plus className="size-4" />
            New workspace
          </Button>
        </div>

        <div className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Your workspaces</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Label className="relative block w-[280px] max-w-full">
                <span className="sr-only">Search workspaces</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search workspaces..."
                  className="h-10 rounded-[0.8rem] border-[#E4E4E7] pl-9"
                />
              </Label>
              <div className="flex items-center rounded-[0.8rem] border border-[#E4E4E7] bg-white p-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8 rounded-[0.6rem] bg-[#EFF6FF] text-[#007AFF] hover:bg-[#EFF6FF]"
                  aria-label="Grid view"
                >
                  <Grid2X2 className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8 rounded-[0.6rem] text-[#64748B]"
                  aria-label="List view"
                >
                  <List className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-[0.8rem] bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredWorkspaces.length > 0 ? (
              filteredWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  onSelect={() => selectWorkspace(workspace.id)}
                  selected={workspace.id === selectedWorkspace?.id}
                  workspace={workspace}
                />
              ))
            ) : (
              <div className="rounded-[0.95rem] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5">
                <Plus className="size-5 text-[#94A3B8]" />
                <h3 className="mt-4 text-sm font-semibold">
                  {workspaces.length === 0
                    ? "No workspaces yet"
                    : "No matching workspaces"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#64748B]">
                  {workspaces.length === 0
                    ? "Use the new workspace button to create your first workspace."
                    : "Try another name or URL."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="sticky top-6 min-h-[360px] rounded-[1.15rem] border border-[#E4E4E7] bg-white p-6 shadow-[0_18px_54px_-44px_rgba(15,23,42,0.55)]">
        {selectedWorkspace ? (
          <WorkspaceInspector
            mode={panelMode}
            onClose={closePanel}
            onModeChange={changePanelMode}
            workspace={selectedWorkspace}
          />
        ) : panelIntent === "create" ? (
          <>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Create workspace</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Choose a name and URL. You will start as the workspace owner.
                </p>
              </div>
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
            </div>
            <WorkspaceCreateForm compact redirectTo="/app/workspaces/new" />
          </>
        ) : (
          <div className="grid min-h-[318px] place-items-center text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-[0.9rem] bg-[#EFF6FF] text-[#007AFF]">
                <Grid2X2 className="size-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">Workspace details</h2>
              <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6 text-slate-500">
                Select a workspace to view details, or use New workspace to
                create another one.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function WorkspaceCard({
  onSelect,
  selected,
  workspace,
}: {
  onSelect: () => void;
  selected: boolean;
  workspace: ApiWorkspace;
}) {
  const createdAt = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(workspace.created_at));

  return (
    <article
      className={`rounded-[0.95rem] border bg-white p-4 transition-colors hover:border-[#BFDBFE] ${
        selected ? "border-[#93C5FD] ring-2 ring-[#DBEAFE]" : "border-[#E4E4E7]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-[0.75rem] bg-[#007AFF] text-sm font-semibold text-white">
            {getWorkspaceInitials(workspace.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold">
              {workspace.name}
            </span>
            <span className="mt-1 block truncate text-sm text-[#64748B]">
              /{workspace.slug}
            </span>
          </span>
        </button>
        <div className="flex items-center gap-1">
          {selected ? (
            <span className="rounded-full bg-[#EFF6FF] px-2 py-1 text-xs font-semibold text-[#007AFF]">
              Current
            </span>
          ) : null}
          <WorkspaceActions workspace={workspace} />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 border-b border-[#F1F5F9] pb-4 text-sm text-[#64748B]">
        <span className="flex items-center gap-2">
          <Users className="size-4" />
          1 member
        </span>
        <span>·</span>
        <span className="flex items-center gap-2">
          <FolderKanban className="size-4" />0 projects
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold capitalize text-[#334155]">
          <span className="grid size-7 place-items-center rounded-full bg-[#09090B] text-[11px] text-white">
            {getWorkspaceInitials(workspace.role).slice(0, 1)}
          </span>
          {workspace.role}
        </span>
        <span className="text-right text-xs font-medium text-[#64748B]">
          Created
          <br />
          {createdAt}
        </span>
      </div>

      <div className="mt-5 flex gap-3">
        <Button
          asChild
          variant="secondary"
          className="h-10 flex-1 rounded-[0.8rem] bg-[#F5F8FF] text-[#007AFF] hover:bg-[#EFF6FF]"
        >
          <a href={`/app?workspace=${workspace.id}`}>Open workspace</a>
        </Button>
        <WorkspaceActions workspace={workspace} compact />
      </div>
    </article>
  );
}

function WorkspaceActions({
  compact = false,
  workspace,
}: {
  compact?: boolean;
  workspace: ApiWorkspace;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={compact ? "icon" : "icon-sm"}
          className={
            compact
              ? "h-10 w-12 rounded-[0.8rem] border-[#E4E4E7]"
              : "rounded-[0.7rem] border-[#E4E4E7]"
          }
          aria-label={`Manage ${workspace.name}`}
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild className="cursor-pointer">
          <a href={`/app?workspace=${workspace.id}`}>
            Open workspace
          </a>
        </DropdownMenuItem>
        <WorkspaceEditDialog workspace={workspace}>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(event) => event.preventDefault()}
          >
            <Edit3 className="size-4" />
            Edit workspace
          </DropdownMenuItem>
        </WorkspaceEditDialog>
        <DropdownMenuSeparator />
        <WorkspaceDeleteDialog workspace={workspace}>
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer"
            onSelect={(event) => event.preventDefault()}
          >
            <Trash2 className="size-4" />
            Delete workspace
          </DropdownMenuItem>
        </WorkspaceDeleteDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function WorkspaceInspector({
  mode,
  onClose,
  onModeChange,
  workspace,
}: {
  mode: "details" | "ai";
  onClose: () => void;
  onModeChange: (mode: "details" | "ai") => void;
  workspace: ApiWorkspace;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Workspace details</h2>
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

      <div className="mt-7 flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-[0.9rem] bg-[#007AFF] text-lg font-semibold text-white">
          {getWorkspaceInitials(workspace.name)}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-2xl font-semibold tracking-tight">
            {workspace.name}
          </h3>
          <p className="mt-1 truncate text-sm text-slate-500">
            /{workspace.slug}
          </p>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 rounded-xl bg-zinc-50 p-1 text-sm font-medium">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onModeChange("details")}
          className={`h-8 rounded-lg ${mode === "details" ? "bg-white shadow-sm hover:bg-white" : "hover:bg-zinc-100"}`}
        >
          Details
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onModeChange("ai")}
          className={`h-8 rounded-lg ${mode === "ai" ? "bg-white shadow-sm hover:bg-white" : "hover:bg-zinc-100"}`}
        >
          AI
        </Button>
      </div>

      {mode === "ai" ? (
        <div className="mt-6 rounded-xl bg-zinc-50 p-4">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-[#007AFF]" />
            <p className="text-sm font-semibold">Ask Relay about this</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Soon, Relay will summarize workspace activity, find blockers, and
            draft updates from projects, tasks, comments, and files.
          </p>
        </div>
      ) : (
        <div className="mt-7 space-y-6">
          <div className="grid gap-2">
            <ContextRow
              icon={Users}
              label="Your role"
              value={capitalize(workspace.role)}
            />
            <ContextRow icon={FolderKanban} label="Projects" value="0" />
            <ContextRow icon={Users} label="Members" value="1" />
            <ContextRow
              icon={CalendarDays}
              label="Created"
              value={formatDate(workspace.created_at)}
            />
          </div>

          <Button
            asChild
            className="h-11 w-full rounded-[0.8rem] bg-[#007AFF] text-white hover:bg-[#006be0]"
          >
            <a href={`/app?workspace=${workspace.id}`}>
              Open workspace
            </a>
          </Button>

          <div>
            <h3 className="text-base font-semibold">Manage</h3>
            <div className="mt-3 space-y-3">
              <WorkspaceEditDialog workspace={workspace}>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full justify-start rounded-[0.8rem]"
                >
                  <Settings className="size-4" />
                  Workspace settings
                </Button>
              </WorkspaceEditDialog>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full justify-start rounded-[0.8rem]"
              >
                <Users className="size-4" />
                Invite members
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full justify-start rounded-[0.8rem]"
              >
                <FolderKanban className="size-4" />
                Create project
              </Button>
              <WorkspaceDeleteDialog workspace={workspace}>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full justify-start rounded-[0.8rem] border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="size-4" />
                  Delete workspace
                </Button>
              </WorkspaceDeleteDialog>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const editInitialState: WorkspaceFormState = {
  message: null,
};

function WorkspaceEditDialog({
  children,
  workspace,
}: {
  children: ReactNode;
  workspace: ApiWorkspace;
}) {
  const canEdit = workspace.role === "owner" || workspace.role === "admin";

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit workspace</DialogTitle>
          <DialogDescription>
            Update the workspace name and URL used across Relay.
          </DialogDescription>
        </DialogHeader>
        <WorkspaceEditForm canEdit={canEdit} workspace={workspace} />
      </DialogContent>
    </Dialog>
  );
}

function WorkspaceEditForm({
  canEdit,
  workspace,
}: {
  canEdit: boolean;
  workspace: ApiWorkspace;
}) {
  const [state, formAction] = useActionState(updateWorkspace, editInitialState);
  const [name, setName] = useState(workspace.name);
  const [slug, setSlug] = useState(workspace.slug);
  const nameError = state.fieldErrors?.name?.[0];
  const slugError = state.fieldErrors?.slug?.[0];

  useEffect(() => {
    setName(workspace.name);
    setSlug(workspace.slug);
  }, [workspace.id, workspace.name, workspace.slug]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="workspaceId" value={workspace.id} />
      <Label htmlFor={`workspace-name-${workspace.id}`} className="space-y-2">
        <span className="text-sm font-semibold text-[#334155]">
          Workspace name
        </span>
        <Input
          id={`workspace-name-${workspace.id}`}
          name="name"
          value={name}
          disabled={!canEdit}
          onChange={(event) => {
            setName(event.target.value);
            setSlug(slugifyWorkspaceName(event.target.value));
          }}
          aria-invalid={Boolean(nameError)}
          className="h-10 rounded-[0.8rem]"
        />
      </Label>
      {nameError ? (
        <p className="text-xs font-medium text-red-600">{nameError}</p>
      ) : null}

      <Label htmlFor={`workspace-slug-${workspace.id}`} className="space-y-2">
        <span className="text-sm font-semibold text-[#334155]">
          Workspace URL
        </span>
        <div className="flex min-w-0 items-center rounded-[0.8rem] border border-[#E4E4E7] bg-white focus-within:border-[#007AFF]/45 focus-within:ring-2 focus-within:ring-[#007AFF]/12">
          <span className="shrink-0 pl-3 text-sm text-[#71717A]">
            relay.app/
          </span>
          <Input
            id={`workspace-slug-${workspace.id}`}
            name="slug"
            value={slug}
            disabled={!canEdit}
            onChange={(event) =>
              setSlug(slugifyWorkspaceName(event.target.value))
            }
            aria-invalid={Boolean(slugError)}
            className="h-10 border-0 bg-transparent pl-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
          />
        </div>
      </Label>
      {slugError ? (
        <p className="text-xs font-medium text-red-600">{slugError}</p>
      ) : null}

      {state.message ? (
        <p className="rounded-[0.8rem] bg-red-50 px-3 py-2 text-xs text-red-700">
          {state.message}
        </p>
      ) : null}

      <UpdateWorkspaceButton disabled={!canEdit} />
    </form>
  );
}

function UpdateWorkspaceButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      className="h-10 w-full rounded-[0.8rem] bg-[#18181B] text-white hover:bg-[#27272A]"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Saving
        </>
      ) : (
        "Save changes"
      )}
    </Button>
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
  const [state, formAction] = useActionState(
    deleteWorkspace,
    deleteInitialState,
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {workspace.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Projects, tasks, files, members, and
            workspace settings tied to this workspace will be removed.
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
    <Button
      type="submit"
      variant="destructive"
      disabled={disabled || pending}
      className="w-full"
    >
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
    <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-3">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="size-4 text-[#007AFF]" />
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
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
