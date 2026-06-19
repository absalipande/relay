"use client";

import {
  Activity,
  Archive,
  Bell,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CirclePause,
  Clock3,
  Columns3,
  FolderKanban,
  HeartPulse,
  Home,
  LayoutDashboard,
  List,
  ListTodo,
  MailPlus,
  PanelLeft,
  Plug,
  Plus,
  Search,
  Settings,
  Settings2,
  Shield,
  User,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
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

type CommandItemConfig = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string;
  label: string;
  shortcut?: string;
};

const primaryNav: NavItemConfig[] = [
  { label: "Home", href: "", icon: Home, navKey: "home" },
  { label: "Projects", href: "/projects", icon: FolderKanban, navKey: "projects" },
  { label: "Tasks", href: "/tasks", icon: ListTodo, navKey: "tasks" },
  { label: "Members", href: "/members", icon: Users, navKey: "members" },
  { label: "Settings", href: "/settings", icon: Settings, navKey: "settings" },
];

function buildCommandItems({
  navItems,
  projects,
  selectedWorkspace,
  workspaces,
}: {
  navItems: NavItemConfig[];
  projects: ShellProject[];
  selectedWorkspace?: ShellWorkspace;
  workspaces: ShellWorkspace[];
}) {
  const navigation: CommandItemConfig[] = [
    ...navItems
      .filter((item) => !item.disabled)
      .map((item) => ({
        href: item.href,
        icon: item.icon,
        keywords: `${item.navKey ?? ""} page destination`,
        label: item.label,
      })),
    {
      href: "/app/workspaces?panel=create",
      icon: UserPlus,
      keywords: "create workspace new team",
      label: "New workspace",
      shortcut: "Create",
    },
    {
      href: "/app/profile",
      icon: User,
      keywords: "profile account user",
      label: "Profile",
    },
    {
      href: "/app/account/settings",
      icon: Settings2,
      keywords: "account settings preferences",
      label: "Account settings",
    },
  ];

  const projectItems: CommandItemConfig[] = selectedWorkspace
    ? projects.map((project) => ({
        href: `/app/workspaces/${selectedWorkspace.id}/projects/${project.id}`,
        icon: FolderKanban,
        keywords: `${project.key} ${project.status} project space`,
        label: `${project.key} - ${project.name}`,
      }))
    : [];

  const workspaceItems: CommandItemConfig[] = workspaces.map((workspace) => ({
    href: `/app?workspace=${workspace.id}`,
    icon: LayoutDashboard,
    keywords: `${workspace.slug} ${workspace.role} workspace`,
    label: workspace.name,
  }));

  return {
    navigation,
    projects: projectItems,
    workspaces: workspaceItems,
  };
}

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [commandOpen, setCommandOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [secondarySidebarOpen, setSecondarySidebarOpen] = useState(false);
  const resolvedActiveNav = activeNav ?? getActiveNav(pathname);
  const resolvedPageTitle = pageTitle ?? getPageTitle(pathname);
  const routeWorkspaceId = getWorkspaceIdFromPath(pathname);
  const requestedWorkspaceId = searchParams.get("workspace") ?? routeWorkspaceId;
  const selectedWorkspace = requestedWorkspaceId
    ? (workspaces.find((workspace) => workspace.id === requestedWorkspaceId) ?? workspaces[0])
    : workspaces[0];
  const workspaceQuery = selectedWorkspace
    ? `?workspace=${encodeURIComponent(selectedWorkspace.id)}`
    : "";
  const resolvedContext = context;
  const hasContext = Boolean(resolvedContext);
  const displayedWorkspaceName = hasWorkspace
    ? (selectedWorkspace?.name ?? workspaceName ?? "Workspace")
    : "No workspace selected";
  const workspaceInitials = hasWorkspace ? displayedWorkspaceName.slice(0, 2).toUpperCase() : "--";
  const accountName = displayName ?? email;
  const visibleProjects = selectedWorkspace
    ? projects.filter(
        (project) => project.workspace_id === selectedWorkspace.id && project.status !== "archived",
      )
    : [];
  const navItems = primaryNav.map((item) =>
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
  );
  const commandItems = useMemo(
    () => buildCommandItems({
      navItems,
      projects: visibleProjects,
      selectedWorkspace,
      workspaces,
    }),
    [navItems, selectedWorkspace, visibleProjects, workspaces],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function runCommand(href: string) {
    setCommandOpen(false);
    router.push(href);
  }

  return (
    <main className="h-dvh overflow-hidden bg-white text-[#111111]">
      <div
        className={`relative grid h-full w-full grid-cols-[minmax(0,1fr)] overflow-hidden bg-white transition-[grid-template-columns] duration-300 ease-out ${
          hasContext
            ? sidebarCollapsed
              ? "xl:grid-cols-[56px_minmax(0,1fr)_360px]"
              : secondarySidebarOpen
                ? "xl:grid-cols-[248px_minmax(0,1fr)_360px]"
                : "xl:grid-cols-[224px_minmax(0,1fr)_360px]"
            : sidebarCollapsed
              ? "xl:grid-cols-[56px_minmax(0,1fr)]"
              : secondarySidebarOpen
                ? "xl:grid-cols-[248px_minmax(0,1fr)]"
                : "xl:grid-cols-[224px_minmax(0,1fr)]"
        }`}
      >
        <aside className="hidden min-h-0 shrink-0 overflow-hidden border-r border-[#E8E8E8] bg-white xl:flex">
          {secondarySidebarOpen || sidebarCollapsed ? (
            <>
              <IconRail
                accountName={accountName}
                email={email}
                navItems={navItems}
                onLogoClick={() => {
                  setSecondarySidebarOpen(false);
                  setSidebarCollapsed(false);
                }}
                onNavigate={() => {
                  setSecondarySidebarOpen(true);
                  setSidebarCollapsed(false);
                }}
                onExpand={() => {
                  setSidebarCollapsed(false);
                }}
                sidebarCollapsed={sidebarCollapsed}
              />

              <div
                className={`flex min-h-0 flex-col overflow-hidden bg-white transition-[width,opacity] duration-300 ease-out ${
                  sidebarCollapsed ? "w-0 opacity-0" : "w-48 opacity-100"
                }`}
              >
                <SidebarPanelHeader
                  displayedWorkspaceName={displayedWorkspaceName}
                  hasWorkspace={hasWorkspace}
                  onToggle={() => {
                    setSecondarySidebarOpen(false);
                    setSidebarCollapsed(false);
                  }}
                  title="Open main sidebar"
                  workspaceInitials={workspaceInitials}
                />
              <SecondarySidebar
                activeNav={resolvedActiveNav ?? "home"}
                pathname={pathname}
                projects={visibleProjects}
                selectedWorkspace={selectedWorkspace}
                workspaceQuery={workspaceQuery}
              />
              </div>
            </>
          ) : (
            <div className="flex min-h-0 w-[224px] flex-col overflow-hidden bg-white">
              <div className="flex h-12 shrink-0 items-center justify-between px-3">
                <Link
                  href="/app"
                  className="flex items-center gap-2.5 rounded-[0.8rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/20"
                >
                  <Image
                    src="/relay-logo.svg"
                    alt=""
                    width={34}
                    height={28}
                    className="h-5 w-auto"
                    priority
                  />
                  <span className="text-[1.08rem] font-semibold tracking-[-0.02em]">
                    relay
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSidebarCollapsed(true);
                  }}
                  className="grid size-8 appearance-none place-items-center rounded-[0.65rem] border-0 bg-transparent p-0 text-[#71717A] shadow-none outline-none transition-colors hover:bg-[#F6F6F7] hover:text-[#111111] focus-visible:ring-2 focus-visible:ring-[#007AFF]/20"
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                >
                  <PanelLeft className="size-4 stroke-[1.85]" />
                </button>
              </div>
              <MainSidebarPanel
                accountName={accountName}
                email={email}
                navItems={navItems}
                onNavigate={() => {
                  setSecondarySidebarOpen(true);
                  setSidebarCollapsed(false);
                }}
                pathname={pathname}
                projects={visibleProjects}
                selectedWorkspace={selectedWorkspace}
              />
            </div>
          )}
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col bg-white">
          <header className="sticky top-0 z-40 shrink-0 bg-white/96 backdrop-blur supports-[backdrop-filter]:bg-white/88">
            <div className="grid h-12 min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 sm:px-5 lg:grid-cols-[minmax(18rem,1fr)_auto] lg:gap-3 lg:px-6">
              <div className="flex min-w-0 items-center gap-3 xl:hidden">
                <Link
                  href="/app"
                  className="flex items-center gap-2 rounded-[0.8rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/20"
                >
                  <Image
                    src="/relay-logo.svg"
                    alt=""
                    width={34}
                    height={28}
                    className="size-7 w-auto"
                    priority
                  />
                  <span className="text-[1.65rem] font-semibold tracking-tight">relay</span>
                </Link>
              </div>

              <div className="hidden min-w-0 items-center gap-2.5 xl:flex">
                <Home className="size-4 text-[#71717A]" />
                <span className="text-[0.8rem] font-medium text-[#A1A1AA]">/</span>
                <span className="truncate text-[0.84rem] font-medium tracking-[-0.01em] text-[#52525B]">
                  {resolvedPageTitle}
                </span>
              </div>

              <div className="flex min-w-0 items-center justify-end gap-3">
                <div className="relative hidden w-[26rem] max-w-[40vw] lg:block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                  <Input
                    readOnly
                    onClick={() => setCommandOpen(true)}
                    onFocus={() => setCommandOpen(true)}
                    placeholder="Search anything..."
                    className="h-8 cursor-pointer rounded-[0.7rem] border border-transparent bg-[#F7F7F8] pl-8 pr-11 text-[0.76rem] shadow-none placeholder:text-[#71717A] hover:bg-[#F4F4F5] focus-visible:border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#D4D4D8]"
                    aria-label="Open command search"
                  />
                  <span className="pointer-events-none absolute right-1.5 top-1/2 flex h-5 -translate-y-1/2 items-center rounded-[0.45rem] bg-[#F4F4F5] px-1.5 text-[0.65rem] font-semibold text-[#71717A]">
                    ⌘ K
                  </span>
                </div>

                <div className="hidden h-6 w-px bg-[#E4E4E7] lg:block" />

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#111111]"
                    aria-label="Notifications"
                  >
                    <Bell className="size-4 stroke-[1.85]" />
                  </Button>
                  <span className="pointer-events-none absolute right-0 top-0 grid size-3.5 place-items-center rounded-full bg-[#4f46e5] text-[0.58rem] font-semibold leading-none text-white ring-2 ring-white">
                    3
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="app-content-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-white px-3 pt-3 pb-[calc(4.5rem+env(safe-area-inset-bottom)+1rem)] sm:px-5 lg:px-6 xl:py-3">
            <div className="mx-auto flex min-h-full w-full max-w-[1380px] flex-col gap-4">
              {children}
            </div>
          </div>
        </section>

        {hasContext ? (
          <aside className="hidden min-h-0 overflow-y-auto border-l border-[#E8E8E8] bg-white px-6 py-6 [scrollbar-width:none] xl:flex xl:flex-col [&::-webkit-scrollbar]:hidden">
            {resolvedContext}
          </aside>
        ) : null}
      </div>

      <CommandDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        title="Search Relay"
        description="Search pages, workspaces, projects, and actions."
        className="top-[20vh] border-0 bg-transparent p-0 shadow-none outline-none ring-0 sm:max-w-[560px]"
      >
        <Command className="overflow-visible rounded-none bg-transparent p-0 text-[#111111] [&_[data-slot=command-input-wrapper]]:p-0 [&_[data-slot=input-group]]:h-11! [&_[data-slot=input-group]]:rounded-[0.85rem]! [&_[data-slot=input-group]]:!border-0 [&_[data-slot=input-group]]:!outline-none [&_[data-slot=input-group]]:!ring-0 [&_[data-slot=input-group]]:bg-white [&_[data-slot=input-group]]:px-3.5 [&_[data-slot=input-group]]:shadow-[0_12px_42px_-36px_rgba(15,23,42,0.45)] [&_[data-slot=input-group]:focus-within]:!border-0 [&_[data-slot=input-group]:focus-within]:!ring-0 [&_[data-slot=command-input]]:text-[0.84rem] [&_[data-slot=command-input]]:placeholder:text-[#71717A]">
          <CommandInput placeholder="Search pages, projects, workspaces..." />
          <CommandList className="mt-3 max-h-[320px] rounded-[0.9rem] border-0 bg-white p-1.5 shadow-[0_18px_56px_-46px_rgba(15,23,42,0.5)]">
            <CommandEmpty className="py-8 text-sm text-[#64748B]">
              No results found.
            </CommandEmpty>

            <CommandGroup
              heading="Navigation"
              className="text-[#111111] **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-2 **:[[cmdk-group-heading]]:text-[0.68rem] **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-[0.12em] **:[[cmdk-group-heading]]:text-[#8A8A8E]"
            >
              {commandItems.navigation.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${item.label} ${item.keywords}`}
                  onSelect={() => runCommand(item.href)}
                  className="h-9 rounded-[0.65rem] px-2.5 text-[0.8rem] data-selected:bg-[#F4F4F5]"
                >
                  <item.icon className="size-4 text-[#71717A]" />
                  <span>{item.label}</span>
                  {item.shortcut ? (
                    <CommandShortcut>{item.shortcut}</CommandShortcut>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>

            {commandItems.projects.length > 0 ? (
              <>
                <CommandSeparator className="my-1 bg-transparent" />
                <CommandGroup
                  heading="Projects"
                  className="text-[#111111] **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-2 **:[[cmdk-group-heading]]:text-[0.68rem] **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-[0.12em] **:[[cmdk-group-heading]]:text-[#8A8A8E]"
                >
                  {commandItems.projects.map((item) => (
                    <CommandItem
                      key={item.href}
                      value={`${item.label} ${item.keywords}`}
                      onSelect={() => runCommand(item.href)}
                      className="h-9 rounded-[0.65rem] px-2.5 text-[0.8rem] data-selected:bg-[#F4F4F5]"
                    >
                      <item.icon className="size-4 text-[#71717A]" />
                      <span className="truncate">{item.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}

            {commandItems.workspaces.length > 0 ? (
              <>
                <CommandSeparator className="my-1 bg-transparent" />
                <CommandGroup
                  heading="Workspaces"
                  className="text-[#111111] **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-2 **:[[cmdk-group-heading]]:text-[0.68rem] **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-[0.12em] **:[[cmdk-group-heading]]:text-[#8A8A8E]"
                >
                  {commandItems.workspaces.map((item) => (
                    <CommandItem
                      key={item.href}
                      value={`${item.label} ${item.keywords}`}
                      onSelect={() => runCommand(item.href)}
                      className="h-9 rounded-[0.65rem] px-2.5 text-[0.8rem] data-selected:bg-[#F4F4F5]"
                    >
                      <item.icon className="size-4 text-[#71717A]" />
                      <span className="truncate">{item.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </CommandDialog>
    </main>
  );
}

function RailNavItem({
  active,
  disabled,
  href,
  icon: Icon,
  label,
  onNavigate,
}: NavItemConfig & { onNavigate?: () => void }) {
  const className = `grid size-8 place-items-center rounded-[0.65rem] transition-colors ${
    active
      ? "bg-[#EFF6FF] text-[#007AFF]"
      : "text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111111]"
  }`;

  if (disabled) {
    return (
      <span className={`${className} cursor-not-allowed opacity-45`} title={label}>
        <Icon className="size-4 stroke-[1.9]" />
      </span>
    );
  }

  return (
    <Link href={href} className={className} title={label} aria-label={label} onClick={onNavigate}>
      <Icon className="size-4 stroke-[1.9]" />
    </Link>
  );
}

function IconRail({
  accountName,
  email,
  navItems,
  onExpand,
  onLogoClick,
  onNavigate,
  sidebarCollapsed,
}: {
  accountName: string;
  email: string;
  navItems: NavItemConfig[];
  onExpand: () => void;
  onLogoClick: () => void;
  onNavigate: () => void;
  sidebarCollapsed: boolean;
}) {
  return (
    <div className="flex w-14 shrink-0 flex-col items-center border-r border-[#E8E8E8] bg-white">
      <button
        type="button"
        onClick={onLogoClick}
        className="grid h-12 w-full place-items-center border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/20"
        aria-label="Open main sidebar"
        title="Open main sidebar"
      >
        <Image
          src="/relay-logo.svg"
          alt=""
          width={28}
          height={22}
          className="h-5 w-auto"
          priority
        />
      </button>

      <button
        type="button"
        onClick={onExpand}
        className={`mt-3 size-8 appearance-none place-items-center rounded-[0.65rem] border-0 bg-transparent p-0 text-[#71717A] shadow-none outline-none transition-colors hover:bg-[#F6F6F7] hover:text-[#111111] focus-visible:ring-2 focus-visible:ring-[#007AFF]/20 ${
          sidebarCollapsed ? "grid" : "hidden"
        }`}
        aria-label="Expand secondary sidebar"
        title="Expand secondary sidebar"
      >
        <PanelLeft className="size-4 rotate-180 stroke-[1.85]" />
      </button>

      <nav className="flex flex-1 flex-col items-center gap-1 py-4">
        {navItems.map((item) => (
          <RailNavItem key={item.label} onNavigate={onNavigate} {...item} />
        ))}
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="mb-4 grid size-8 place-items-center rounded-full bg-[#030712] text-xs font-semibold text-white"
            aria-label="Open account menu"
          >
            {getInitial(accountName)}
          </button>
        </DropdownMenuTrigger>
        <AccountDropdownContent accountName={accountName} email={email} />
      </DropdownMenu>
    </div>
  );
}

function SidebarPanelHeader({
  displayedWorkspaceName,
  hasWorkspace,
  onToggle,
  title,
  workspaceInitials,
}: {
  displayedWorkspaceName: string;
  hasWorkspace: boolean;
  onToggle: () => void;
  title: string;
  workspaceInitials: string;
}) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between px-4">
      <button className="flex min-w-0 items-center gap-2 text-left">
        <span
          className={`grid size-7 shrink-0 place-items-center overflow-hidden rounded-[0.5rem] text-[0.65rem] font-semibold text-white ${
            hasWorkspace ? "bg-[#007AFF]" : "bg-[#94A3B8]"
          }`}
        >
          {workspaceInitials}
        </span>
        <span className="min-w-0 flex items-center gap-1.5">
          <span className="truncate text-[0.88rem] font-semibold tracking-[-0.01em]">
            {displayedWorkspaceName}
          </span>
          {hasWorkspace ? <ChevronDown className="size-3.5 shrink-0 text-[#71717A]" /> : null}
        </span>
      </button>
      <button
        type="button"
        onClick={onToggle}
        className="grid size-8 appearance-none place-items-center rounded-[0.65rem] border-0 bg-transparent p-0 text-[#71717A] shadow-none outline-none transition-colors hover:bg-[#F6F6F7] hover:text-[#111111] focus-visible:ring-2 focus-visible:ring-[#007AFF]/20"
        aria-label={title}
        title={title}
      >
        <PanelLeft className="size-4 rotate-180 stroke-[1.85]" />
      </button>
    </div>
  );
}

function AccountDropdownContent({ accountName, email }: { accountName: string; email: string }) {
  return (
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
        <span className="block truncate text-[0.7rem] font-medium text-[#71717A]">{email}</span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator className="bg-[#E4E4E7]" />
      <DropdownMenuItem asChild className="rounded-[0.65rem] px-2 py-1.5 text-[0.82rem]">
        <Link href="/app/profile">
          <User className="size-3.5" />
          Profile
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="rounded-[0.65rem] px-2 py-1.5 text-[0.82rem]">
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
  );
}

function MainSidebarPanel({
  accountName,
  email,
  navItems,
  onNavigate,
  pathname,
  projects,
  selectedWorkspace,
}: {
  accountName: string;
  email: string;
  navItems: NavItemConfig[];
  onNavigate: () => void;
  pathname: string;
  projects: ShellProject[];
  selectedWorkspace?: ShellWorkspace;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="px-2.5 py-3">
        <Link
          href="/app/workspaces?panel=create"
          className="flex w-fit items-center gap-1.5 rounded-[0.55rem] px-1.5 py-1 text-[0.72rem] font-semibold text-[#007AFF] transition-colors hover:bg-[#EFF6FF]"
        >
          <Plus className="size-3.5" />
          New workspace
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <MainSidebarSection label="Navigation">
          {navItems.map((item) => (
            <MainSidebarItem key={item.label} item={item} onNavigate={onNavigate} />
          ))}
        </MainSidebarSection>

        {selectedWorkspace ? (
          <div className="mt-4 border-t border-[#E4E4E7] pt-4">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#A1A1AA]">
                Projects
              </p>
              <ProjectCreateDialog
                triggerVariant="icon"
                workspaceId={selectedWorkspace.id}
                workspaceName={selectedWorkspace.name}
              />
            </div>
            <div className="space-y-1">
              {projects.length > 0 ? (
                projects.map((project) => {
                  const href = `/app/workspaces/${selectedWorkspace.id}/projects/${project.id}`;
                  const active = pathname === href;

                  return (
                    <Link
                      key={project.id}
                      href={href}
                      onClick={onNavigate}
                      className={`flex h-8 items-center gap-2 rounded-[0.65rem] px-2 text-[0.76rem] font-medium transition-colors ${
                        active
                          ? "bg-[#EFF6FF] text-[#007AFF]"
                          : "text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#18181B]"
                      }`}
                    >
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-[0.5rem] text-[0.58rem] font-semibold ${
                          active ? "bg-white text-[#007AFF]" : "bg-[#F4F4F5] text-[#64748B]"
                        }`}
                      >
                        {project.key.slice(0, 2)}
                      </span>
                      <span className="truncate">{project.name}</span>
                    </Link>
                  );
                })
              ) : (
                <p className="px-2 py-2 text-[0.72rem] leading-5 text-[#94A3B8]">No projects yet</p>
              )}
            </div>
          </div>
        ) : null}
      </nav>

      <div className="shrink-0 px-2.5 pb-3 pt-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-[0.75rem] border border-[#E4E4E7] bg-white p-2.5 text-left shadow-[0_12px_34px_-30px_rgba(15,23,42,0.22)] transition-colors hover:bg-[#FAFAFA]"
              aria-label="Open account menu"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#030712] text-xs font-semibold text-white">
                {getInitial(accountName)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.76rem] font-semibold leading-4">
                  {accountName}
                </span>
                <span className="block text-[0.68rem] leading-4 text-[#71717A]">Signed in</span>
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-[#71717A]" />
            </button>
          </DropdownMenuTrigger>
          <AccountDropdownContent accountName={accountName} email={email} />
        </DropdownMenu>
      </div>
    </div>
  );
}

function MainSidebarSection({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div>
      <p className="mb-2 px-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#A1A1AA]">
        {label}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function MainSidebarItem({ item, onNavigate }: { item: NavItemConfig; onNavigate: () => void }) {
  const Icon = item.icon;
  const className = `flex h-8 items-center gap-2 rounded-[0.65rem] px-2 text-[0.76rem] font-medium transition-colors ${
    item.active
      ? "bg-[#EFF6FF] text-[#007AFF]"
      : "text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#18181B]"
  }`;
  const content = (
    <>
      <Icon className={`size-3.5 shrink-0 ${item.active ? "text-[#007AFF]" : "text-[#8A8F98]"}`} />
      <span className="truncate">{item.label}</span>
    </>
  );

  if (item.disabled) {
    return (
      <span className={`${className} cursor-not-allowed opacity-50`} title={item.label}>
        {content}
      </span>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      {content}
    </Link>
  );
}

function SecondarySidebar({
  activeNav,
  pathname,
  projects,
  selectedWorkspace,
  workspaceQuery,
}: {
  activeNav: NavKey;
  pathname: string;
  projects: ShellProject[];
  selectedWorkspace?: ShellWorkspace;
  workspaceQuery: string;
}) {
  const sections = getSecondarySections(activeNav, selectedWorkspace, workspaceQuery);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mb-4">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#A1A1AA]">
          {getSecondaryEyebrow(activeNav)}
        </p>
        <h2 className="mt-1 truncate text-[0.94rem] font-semibold tracking-[-0.01em] text-[#18181B]">
          {getSecondaryTitle(activeNav)}
        </h2>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <SecondarySection key={section.label} section={section} />
        ))}

        {activeNav === "projects" && selectedWorkspace ? (
          <div className="border-t border-[#E4E4E7] pt-4">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#A1A1AA]">
                Spaces
              </p>
              <ProjectCreateDialog
                triggerVariant="icon"
                workspaceId={selectedWorkspace.id}
                workspaceName={selectedWorkspace.name}
              />
            </div>
            <div className="space-y-1">
              {projects.length > 0 ? (
                projects.map((project) => {
                  const href = `/app/workspaces/${selectedWorkspace.id}/projects/${project.id}`;
                  const active = pathname === href;

                  return (
                    <Link
                      key={project.id}
                      href={href}
                      className={`flex h-8 items-center gap-2 rounded-[0.65rem] px-2 text-[0.76rem] font-medium transition-colors ${
                        active
                          ? "bg-[#EFF6FF] text-[#007AFF]"
                          : "text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#18181B]"
                      }`}
                    >
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-[0.5rem] text-[0.58rem] font-semibold ${
                          active ? "bg-white text-[#007AFF]" : "bg-[#F4F4F5] text-[#64748B]"
                        }`}
                      >
                        {project.key.slice(0, 2)}
                      </span>
                      <span className="truncate">{project.name}</span>
                    </Link>
                  );
                })
              ) : (
                <p className="px-2 py-2 text-[0.72rem] leading-5 text-[#94A3B8]">No projects yet</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type SecondarySectionConfig = {
  items: Array<{
    href?: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    meta?: string;
  }>;
  label: string;
};

function SecondarySection({ section }: { section: SecondarySectionConfig }) {
  return (
    <div>
      <p className="mb-2 px-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#A1A1AA]">
        {section.label}
      </p>
      <div className="space-y-1">
        {section.items.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon className="size-3.5 shrink-0 text-[#8A8F98]" />
              <span className="truncate">{item.label}</span>
              {item.meta ? (
                <span className="ml-auto shrink-0 text-[0.68rem] font-medium text-[#A1A1AA]">
                  {item.meta}
                </span>
              ) : null}
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex h-8 items-center gap-2 rounded-[0.65rem] px-2 text-[0.76rem] font-medium text-[#52525B] transition-colors hover:bg-[#F4F4F5] hover:text-[#18181B]"
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              className="flex h-8 w-full items-center gap-2 rounded-[0.65rem] px-2 text-left text-[0.76rem] font-medium text-[#52525B] transition-colors hover:bg-[#F4F4F5] hover:text-[#18181B]"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getSecondaryEyebrow(activeNav: NavKey) {
  switch (activeNav) {
    case "projects":
      return "Workspace";
    case "tasks":
      return "Work queue";
    case "members":
      return "Team";
    case "settings":
      return "Admin";
    case "home":
    default:
      return "Workspace";
  }
}

function getSecondaryTitle(activeNav: NavKey) {
  switch (activeNav) {
    case "projects":
      return "Projects";
    case "tasks":
      return "Tasks";
    case "members":
      return "Members";
    case "settings":
      return "Settings";
    case "home":
    default:
      return "Home";
  }
}

function getSecondarySections(
  activeNav: NavKey,
  selectedWorkspace: ShellWorkspace | undefined,
  workspaceQuery: string,
): SecondarySectionConfig[] {
  const workspaceBase = selectedWorkspace ? `/app/workspaces/${selectedWorkspace.id}` : "/app";

  switch (activeNav) {
    case "projects":
      return [
        {
          label: "Views",
          items: [
            { href: `${workspaceBase}/projects`, icon: FolderKanban, label: "All projects" },
            { icon: CheckCircle2, label: "Active", meta: "soon" },
            { icon: CirclePause, label: "Paused", meta: "soon" },
            { icon: Archive, label: "Archived", meta: "soon" },
          ],
        },
      ];
    case "tasks":
      return [
        {
          label: "Views",
          items: [
            { href: `${workspaceBase}/tasks`, icon: ListTodo, label: "All tasks" },
            { icon: UserCheck, label: "My tasks" },
            { icon: Clock3, label: "Due soon" },
            { icon: BellRing, label: "Blocked" },
          ],
        },
        {
          label: "Layouts",
          items: [
            { icon: List, label: "List" },
            { icon: Columns3, label: "Board" },
            { icon: CalendarDays, label: "Calendar" },
          ],
        },
      ];
    case "members":
      return [
        {
          label: "People",
          items: [
            { href: `${workspaceBase}/members`, icon: Users, label: "Directory" },
            { icon: UserPlus, label: "Invites" },
            { icon: Shield, label: "Roles" },
            { icon: UserCheck, label: "Ownership" },
          ],
        },
      ];
    case "settings":
      return [
        {
          label: "Workspace",
          items: [
            { href: `${workspaceBase}/settings`, icon: Settings2, label: "General" },
            { icon: Shield, label: "Members & roles" },
            { icon: Bell, label: "Notifications" },
            { icon: Plug, label: "Integrations" },
          ],
        },
      ];
    case "home":
    default:
      return [
        {
          label: "Overview",
          items: [
            { href: `/app${workspaceQuery}`, icon: LayoutDashboard, label: "Dashboard" },
            { icon: Activity, label: "Activity" },
            { icon: MailPlus, label: "Assigned to me" },
            { icon: Clock3, label: "Due soon" },
            { icon: HeartPulse, label: "Workspace health" },
          ],
        },
      ];
  }
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

  if (pathname.includes("/projects")) {
    return "projects";
  }

  if (pathname.includes("/tasks")) {
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
    return "Tasks";
  }

  if (pathname.startsWith("/app/profile")) {
    return "Profile";
  }

  if (pathname === "/app/workspaces" || pathname.startsWith("/app/workspaces/new")) {
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
