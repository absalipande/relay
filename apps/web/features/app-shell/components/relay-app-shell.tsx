"use client";

import {
  Bell,
  ChevronDown,
  Home,
  ListTodo,
  PanelLeft,
  Plus,
  Search,
  Settings,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ProjectCreateDialog } from "@/features/projects/components/project-create-dialog";
import { signOut } from "@/features/workspaces/actions";

type RelayAppShellProps = {
  activeNav?: NavKey;
  children: React.ReactNode;
  context?: React.ReactNode;
  displayName?: string;
  email: string;
  hasWorkspace?: boolean;
  pageTitle?: string;
  projects?: ShellProject[];
  workspaces?: ShellWorkspace[];
  workspaceName?: string;
};

type NavKey = "home" | "tasks" | "settings" | "members" | "projects";

type ShellWorkspace = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  role: string;
};

type ShellProject = {
  id: string;
  workspace_id: string;
  name: string;
  key: string;
  status: "active" | "paused" | "archived";
};

type NavItemConfig = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  navKey?: NavKey;
  active?: boolean;
  disabled?: boolean;
};

const primaryNav: NavItemConfig[] = [
  { label: "Home", href: "", icon: Home, navKey: "home" },
  { label: "My Tasks", href: "/tasks", icon: ListTodo, navKey: "tasks" },
  { label: "Settings", href: "/settings", icon: Settings, navKey: "settings" },
  { label: "Members", href: "/members", icon: Users, navKey: "members" },
];

export function RelayAppShell({
  activeNav,
  children,
  context,
  displayName,
  email,
  hasWorkspace = false,
  pageTitle,
  projects = [],
  workspaces = [],
  workspaceName,
}: RelayAppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resolvedActiveNav = activeNav ?? getActiveNav(pathname);
  const resolvedPageTitle = pageTitle ?? getPageTitle(pathname);
  const routeWorkspaceId = getWorkspaceIdFromPath(pathname);
  const requestedWorkspaceId = searchParams.get("workspace") ?? routeWorkspaceId;
  const selectedWorkspace = requestedWorkspaceId
    ? (workspaces.find((workspace) => workspace.id === requestedWorkspaceId) ??
      workspaces[0])
    : workspaces[0];
  const workspaceQuery = selectedWorkspace
    ? `?workspace=${encodeURIComponent(selectedWorkspace.id)}`
    : "";
  const resolvedContext = context;
  const hasContext = Boolean(resolvedContext);
  const displayedWorkspaceName = hasWorkspace
    ? (selectedWorkspace?.name ?? workspaceName ?? "Workspace")
    : "No workspace selected";
  const workspaceInitials = hasWorkspace
    ? displayedWorkspaceName.slice(0, 2).toUpperCase()
    : "--";
  const accountName = displayName ?? email;
  const visibleProjects = selectedWorkspace
    ? projects.filter(
        (project) =>
          project.workspace_id === selectedWorkspace.id &&
          project.status !== "archived",
      )
    : [];

  return (
    <main className="h-[var(--relay-app-height)] overflow-hidden bg-white text-[#111111]">
      <div
        className={`mx-auto grid h-[var(--relay-app-height)] min-h-[720px] w-full max-w-[1680px] origin-top bg-white xl:h-[calc(var(--relay-app-height)*1.25)] xl:[zoom:0.8] ${
          hasContext
            ? "xl:grid-cols-[272px_minmax(0,1fr)_360px]"
            : "xl:grid-cols-[272px_minmax(0,1fr)]"
        }`}
      >
        <aside className="sticky top-0 hidden h-[var(--relay-app-height)] shrink-0 self-start overflow-y-auto bg-white px-5 py-5 [scrollbar-width:none] xl:flex xl:h-full xl:flex-col [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center justify-between pb-5">
            <Link
              href="/app"
              className="flex w-fit items-center gap-3 rounded-[1rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/20"
              aria-label="Go to Relay dashboard"
            >
              <img src="/relay-logo.svg" alt="" className="h-7 w-auto" />
              <span className="text-[1.28rem] font-semibold tracking-tight">
                relay
              </span>
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-[0.75rem] text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111111]"
              aria-label="Collapse sidebar"
            >
              <PanelLeft className="size-[1.05rem] stroke-[1.85]" />
            </Button>
          </div>

          <div className="mb-5">
            <button className="flex w-full items-center justify-between rounded-[0.95rem] border border-[#E4E4E7] bg-white px-3 py-2.5 text-left shadow-[0_12px_34px_-30px_rgba(15,23,42,0.35)] transition-colors hover:bg-[#FAFAFA]">
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-[0.75rem] text-[0.78rem] font-semibold text-white ${
                    hasWorkspace ? "bg-[#007AFF]" : "bg-[#94A3B8]"
                  }`}
                >
                  {workspaceInitials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.9rem] font-semibold leading-5 tracking-[-0.01em]">
                    {displayedWorkspaceName}
                  </span>
                  <span className="block text-[0.76rem] leading-4 text-[#71717A]">
                    {hasWorkspace ? "Workspace" : "Create a workspace to begin"}
                  </span>
                </span>
              </span>
              {hasWorkspace ? (
                <ChevronDown className="size-4 text-[#9CA3AF]" />
              ) : null}
            </button>
            <Link
              href="/app/workspaces/new"
              className="mt-2 flex w-full items-center gap-2 rounded-[0.75rem] px-2 py-1.5 text-[0.78rem] font-semibold text-[#007AFF] transition-colors hover:bg-[#EFF6FF]"
            >
              <Plus className="size-3.5" />
              New workspace
            </Link>
          </div>

          <nav className="mb-5 flex-1 space-y-4">
            <NavGroup
              label="Navigation"
              items={primaryNav.map((item) =>
                selectedWorkspace
                  ? {
                      ...item,
                      href:
                        item.navKey === "home"
                          ? `/app${workspaceQuery}`
                          : `/app/workspaces/${selectedWorkspace.id}${item.href}`,
                      active: item.navKey === resolvedActiveNav,
                    }
                  : { ...item, disabled: true },
              )}
            />
            {selectedWorkspace ? (
              <ProjectNavGroup
                pathname={pathname}
                projects={visibleProjects}
                workspace={selectedWorkspace}
              />
            ) : null}
          </nav>

          <div className="space-y-4 pb-4">
            <div className="flex items-center gap-3 rounded-[0.95rem] border border-[#E4E4E7] bg-white p-3 shadow-[0_12px_34px_-30px_rgba(15,23,42,0.35)]">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#030712] text-sm font-semibold text-white">
                {getInitial(accountName)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.86rem] font-semibold leading-5">
                  {accountName}
                </span>
                <span className="block text-[0.78rem] leading-4 text-[#71717A]">
                  Signed in
                </span>
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded-[0.65rem] p-1 text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#111111]"
                    aria-label="Open account menu"
                  >
                    <ChevronDown className="size-4 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="top"
                  sideOffset={8}
                  className="w-56 rounded-[0.9rem] border border-[#E4E4E7] bg-white p-1.5 shadow-[0_24px_60px_-35px_rgba(17,17,17,0.22)]"
                >
                  <DropdownMenuLabel className="px-2 py-1.5">
                    <span className="block truncate text-[0.78rem] font-semibold text-[#111111]">
                      {accountName}
                    </span>
                    <span className="block truncate text-[0.7rem] font-medium text-[#71717A]">
                      {email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#E4E4E7]" />
                  <DropdownMenuItem
                    asChild
                    className="rounded-[0.65rem] px-2 py-1.5 text-[0.82rem]"
                  >
                    <Link href="/app/profile">
                      <User className="size-3.5" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-[0.65rem] px-2 py-1.5 text-[0.82rem]"
                  >
                    <Link href="/app/account/settings">
                      <Settings className="size-3.5" />
                      Account settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#E4E4E7]" />
                  <DropdownMenuItem
                    asChild
                    variant="destructive"
                    className="rounded-[0.65rem] px-2 py-1.5 text-[0.82rem]"
                  >
                    <form action={signOut} className="w-full">
                      <button type="submit" className="w-full text-left">
                        Sign out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col bg-white">
          <header className="sticky top-0 z-40 shrink-0 bg-white/96 backdrop-blur supports-[backdrop-filter]:bg-white/88">
            <div className="grid h-[4.65rem] min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 sm:px-5 lg:grid-cols-[minmax(18rem,1fr)_auto] lg:gap-4 lg:px-8">
              <div className="flex min-w-0 items-center gap-3 xl:hidden">
                <Link
                  href="/app"
                  className="flex items-center gap-2 rounded-[0.8rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/20"
                >
                  <img src="/relay-logo.svg" alt="" className="size-7 w-auto" />
                  <span className="text-[1.65rem] font-semibold tracking-tight">
                    relay
                  </span>
                </Link>
              </div>

              <div className="hidden min-w-0 items-center gap-3 xl:flex">
                <Home className="size-[1.05rem] text-[#71717A]" />
                <span className="text-[0.86rem] font-medium text-[#A1A1AA]">
                  /
                </span>
                <span className="truncate text-[0.9rem] font-medium tracking-[-0.01em] text-[#52525B]">
                  {resolvedPageTitle}
                </span>
              </div>

              <div className="flex min-w-0 items-center justify-end gap-4">
                <div className="relative hidden w-[28rem] max-w-[42vw] lg:block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
                  <Input
                    placeholder="Search anything..."
                    className="h-10 rounded-[0.85rem] border border-[#E4E4E7] bg-white pl-9 pr-12 text-[0.84rem] shadow-none focus-visible:border-[#007AFF]/45 focus-visible:ring-2 focus-visible:ring-[#007AFF]/12"
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 flex h-6 -translate-y-1/2 items-center rounded-[0.5rem] bg-[#F4F4F5] px-1.5 text-[0.68rem] font-semibold text-[#71717A]">
                    ⌘ K
                  </span>
                </div>

                <div className="hidden h-8 w-px bg-[#E4E4E7] lg:block" />

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-full text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#111111]"
                    aria-label="Notifications"
                  >
                    <Bell className="size-[1.08rem] stroke-[1.85]" />
                  </Button>
                  <span className="pointer-events-none absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-[#4f46e5] text-[0.62rem] font-semibold leading-none text-white ring-2 ring-white">
                    3
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="app-content-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-white px-3 pt-3 pb-[calc(4.5rem+env(safe-area-inset-bottom)+1rem)] sm:px-5 sm:pt-4 lg:px-6 xl:py-4">
            <div className="mx-auto flex min-h-full w-full max-w-[1380px] flex-col gap-4">
              {children}
            </div>
          </div>
        </section>

        {hasContext ? (
          <aside className="sticky top-0 hidden h-[var(--relay-app-height)] overflow-y-auto bg-white px-6 py-6 [scrollbar-width:none] xl:flex xl:h-full xl:flex-col [&::-webkit-scrollbar]:hidden">
            {resolvedContext}
          </aside>
        ) : null}
      </div>
    </main>
  );
}

function NavGroup({
  label,
  items,
  separated = false,
}: {
  label: string;
  items: NavItemConfig[];
  separated?: boolean;
}) {
  return (
    <div className={separated ? "border-t border-[#E4E4E7] pt-4" : ""}>
      <p className="mb-1.5 px-3 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}

function ProjectNavGroup({
  pathname,
  projects,
  workspace,
}: {
  pathname: string;
  projects: ShellProject[];
  workspace: ShellWorkspace;
}) {
  return (
    <div className="border-t border-[#E4E4E7] pt-4">
      <div className="mb-1.5 flex items-center justify-between px-3">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
          Projects
        </p>
        <ProjectCreateDialog
          triggerVariant="icon"
          workspaceId={workspace.id}
          workspaceName={workspace.name}
        />
      </div>
      <div className="space-y-0.5">
        {projects.length > 0 ? (
          projects.map((project) => {
            const href = `/app/workspaces/${workspace.id}/projects/${project.id}`;
            const active = pathname === href;

            return (
              <Link
                key={project.id}
                href={href}
                className={`flex items-center gap-2.5 rounded-[0.85rem] px-3 py-2 text-[0.86rem] font-medium transition-colors ${
                  active
                    ? "bg-[#eff6ff] text-[#007AFF]"
                    : "text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#18181B]"
                }`}
              >
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-[0.6rem] text-[0.66rem] font-semibold ${
                    active
                      ? "bg-white text-[#007AFF]"
                      : "bg-[#F4F4F5] text-[#64748B]"
                  }`}
                >
                  {project.key.slice(0, 2)}
                </span>
                <span className="truncate">{project.name}</span>
              </Link>
            );
          })
        ) : (
          <p className="px-3 py-2 text-[0.78rem] leading-5 text-[#94A3B8]">
            No projects yet
          </p>
        )}
      </div>
    </div>
  );
}

function NavItem({
  label,
  href,
  icon: Icon,
  active = false,
  disabled = false,
}: NavItemConfig) {
  if (disabled) {
    return (
      <span
        className="flex cursor-not-allowed items-center gap-3 rounded-[0.95rem] px-3 py-2 text-[0.9rem] font-medium text-[#A1A1AA]"
        title="Create a workspace first"
      >
        <span className="flex size-8 items-center justify-center rounded-[0.75rem] text-[#A1A1AA]">
          <Icon className="size-[1.02rem] stroke-[1.9]" />
        </span>
        <span className="tracking-[-0.01em]">{label}</span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-[0.95rem] px-3 py-2 text-[0.9rem] font-medium transition-colors ${
        active
          ? "bg-[#eff6ff] text-[#007AFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.78),inset_0_0_0_1px_rgba(0,122,255,0.04)]"
          : "text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#18181B]"
      }`}
    >
      <span
        className={`flex size-8 items-center justify-center rounded-[0.75rem] ${
          active ? "text-[#007AFF]" : "text-[#71717A]"
        }`}
      >
        <Icon className="size-[1.02rem] stroke-[1.9]" />
      </span>
      <span className="tracking-[-0.01em]">{label}</span>
    </Link>
  );
}

function getInitial(email: string) {
  return email.trim().charAt(0).toUpperCase() || "R";
}

function getActiveNav(pathname: string): NavKey | undefined {
  if (pathname.includes("/settings")) {
    return "settings";
  }

  if (pathname.includes("/members")) {
    return "members";
  }

  if (pathname.includes("/projects/")) {
    return "projects";
  }

  if (pathname.includes("/tasks/")) {
    return "tasks";
  }

  if (pathname === "/app") {
    return "home";
  }

  return undefined;
}

function getPageTitle(pathname: string) {
  if (pathname.startsWith("/app/account/settings")) {
    return "Account Settings";
  }

  if (pathname.includes("/members")) {
    return "Members";
  }

  if (pathname.includes("/settings")) {
    return "Workspace Settings";
  }

  if (pathname.endsWith("/tasks")) {
    return "My Tasks";
  }

  if (pathname.startsWith("/app/profile")) {
    return "Profile";
  }

  if (pathname.startsWith("/app/workspaces/new")) {
    return "Workspaces";
  }

  if (pathname.includes("/projects/")) {
    return "Project";
  }

  if (pathname.includes("/tasks/")) {
    return "Task";
  }

  return "Workspace Overview";
}

function getWorkspaceIdFromPath(pathname: string) {
  const match = pathname.match(/^\/app\/workspaces\/([^/]+)/);
  return match?.[1];
}
