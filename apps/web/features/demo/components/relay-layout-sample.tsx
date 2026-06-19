"use client";

import {
  Activity,
  Bell,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDotDashed,
  ClipboardList,
  FolderKanban,
  Home,
  LayoutDashboard,
  ListFilter,
  ListTodo,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type SectionKey = "home" | "projects" | "tasks" | "analytics" | "ai";
type InspectorTab = "details" | "ai";
type SelectedItem = {
  meta: string;
  title: string;
};

type NavItem = {
  key: SectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "tasks", label: "Tasks", icon: ListTodo },
  { key: "analytics", label: "Analytics", icon: Activity },
  { key: "ai", label: "AI apps", icon: Bot },
];

const sectionContent: Record<
  SectionKey,
  {
    channels: Array<{ count?: string; icon: React.ComponentType<{ className?: string }>; label: string }>;
    eyebrow: string;
    title: string;
  }
> = {
  home: {
    channels: [
      { count: "8", icon: LayoutDashboard, label: "Workspace overview" },
      { count: "4", icon: Bell, label: "Inbox" },
      { icon: CalendarDays, label: "Today" },
    ],
    eyebrow: "Workspace",
    title: "Home",
  },
  projects: {
    channels: [
      { count: "14", icon: FolderKanban, label: "Launch" },
      { count: "8", icon: CircleDotDashed, label: "Platform" },
      { count: "6", icon: CheckCircle2, label: "Mobile" },
      { icon: Settings, label: "Project settings" },
    ],
    eyebrow: "Project channels",
    title: "Projects",
  },
  tasks: {
    channels: [
      { count: "12", icon: ClipboardList, label: "All tasks" },
      { count: "5", icon: UserRound, label: "Assigned to me" },
      { count: "3", icon: ListFilter, label: "Blocked" },
      { icon: CalendarDays, label: "Due this week" },
    ],
    eyebrow: "Task views",
    title: "Tasks",
  },
  analytics: {
    channels: [
      { count: "72%", icon: Activity, label: "Delivery health" },
      { count: "18%", icon: Users, label: "Team load" },
      { icon: CalendarDays, label: "Cycle time" },
    ],
    eyebrow: "Insights",
    title: "Analytics",
  },
  ai: {
    channels: [
      { icon: Sparkles, label: "Summarize project" },
      { icon: MessageSquareText, label: "Draft update" },
      { icon: ClipboardList, label: "Extract tasks" },
    ],
    eyebrow: "Assistant flows",
    title: "AI apps",
  },
};

const tasks = [
  ["Finalize onboarding checklist", "Launch", "Done"],
  ["Review sprint blockers", "Platform", "In progress"],
  ["Draft customer update", "Launch", "Review"],
  ["Triage beta feedback", "Mobile", "In progress"],
  ["Prepare release notes", "Platform", "To do"],
];

export function RelayLayoutSample() {
  const [activeSection, setActiveSection] = useState<SectionKey>("home");
  const [collapsed, setCollapsed] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>({
    meta: "Workspace",
    title: "Vision Room",
  });
  const active = sectionContent[activeSection];
  const inspectorColumn = inspectorOpen ? "360px" : "0px";
  const columns = collapsed
    ? `48px minmax(188px,208px) minmax(0,1fr) ${inspectorColumn}`
    : `224px 0px minmax(0,1fr) ${inspectorColumn}`;

  const activeNav = useMemo(
    () => navItems.find((item) => item.key === activeSection) ?? navItems[0],
    [activeSection],
  );

  function chooseSection(section: SectionKey) {
    setActiveSection(section);
    setCollapsed(section !== "home");
  }

  function openInspector(item: SelectedItem) {
    setSelectedItem(item);
    setInspectorOpen(true);
  }

  return (
    <main className="h-dvh w-screen overflow-hidden bg-white text-[#111111]">
      <div className="flex h-full w-full overflow-hidden bg-white">
        <div
          className="grid min-w-0 flex-1 transition-[grid-template-columns] duration-300 ease-out"
          style={{ gridTemplateColumns: columns }}
        >
          {collapsed ? (
            <IconRail
              activeSection={activeSection}
              chooseSection={chooseSection}
              expand={() => setCollapsed(false)}
            />
          ) : (
            <MainSidebar
              activeSection={activeSection}
              chooseSection={chooseSection}
              collapse={() => setCollapsed(true)}
            />
          )}

          <ContextSidebar
            active={active}
            activeNav={activeNav}
            collapsed={collapsed}
          />

          <WorkspaceCanvas
            active={active}
            activeSection={activeSection}
            collapse={() => setCollapsed(true)}
            openInspector={openInspector}
          />

          <Inspector
            active={active}
            activeSection={activeSection}
            onClose={() => setInspectorOpen(false)}
            open={inspectorOpen}
            selectedItem={selectedItem}
          />
        </div>
      </div>
    </main>
  );
}

function MainSidebar({
  activeSection,
  chooseSection,
  collapse,
}: {
  activeSection: SectionKey;
  chooseSection: (section: SectionKey) => void;
  collapse: () => void;
}) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-[#EEEEEE] bg-white">
      <div className="flex h-14 shrink-0 items-center gap-2.5 px-4">
        <Link
          href="/relay-layout-sample"
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[0.65rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/20"
        >
          <Image
            src="/relay-logo.svg"
            alt=""
            width={36}
            height={36}
            className="h-7 w-auto"
            priority
          />
          <span className="truncate text-[1.05rem] font-semibold tracking-tight text-[#111111]">
            relay
          </span>
        </Link>
        <button
          className="grid size-7 shrink-0 place-items-center rounded-[0.55rem] text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#111111]"
          onClick={collapse}
          aria-label="Collapse main sidebar"
          type="button"
        >
          <PanelLeft className="size-3.5" />
        </button>
      </div>

      <div className="app-content-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <button className="flex w-full items-center gap-2.5 rounded-[0.85rem] border border-[#E6E6E9] bg-white px-2.5 py-2.5 text-left transition-colors hover:bg-[#FAFAFA]">
          <span className="grid size-9 shrink-0 place-items-center rounded-[0.7rem] bg-[#007AFF] text-xs font-semibold text-white">
            VR
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold leading-5 text-[#111111]">
              Vision Room
            </span>
            <span className="mt-0.5 block text-xs leading-4 text-[#71717A]">
              Workspace
            </span>
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-[#71717A]" />
        </button>

        <button
          className="mt-4 flex w-fit items-center gap-1.5 rounded-[0.55rem] px-1.5 py-1 text-sm font-semibold text-[#007AFF] transition-colors hover:bg-[#EFF6FF]"
          onClick={() => chooseSection("home")}
          type="button"
        >
          <Plus className="size-3.5" />
          New workspace
        </button>

        <nav className="mt-7">
          <p className="mb-3 px-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#A1A1AA]">
            Navigation
          </p>
          <div className="space-y-1">
            <ProductionSidebarAction
              active={activeSection === "home"}
              icon={Home}
              label="Home"
              onClick={() => chooseSection("home")}
            />
            <ProductionSidebarAction
              active={activeSection === "tasks"}
              icon={ListTodo}
              label="My Tasks"
              onClick={() => chooseSection("tasks")}
            />
            <ProductionSidebarAction
              active={false}
              icon={Settings}
              label="Settings"
              onClick={() => chooseSection("ai")}
            />
            <ProductionSidebarAction
              active={false}
              icon={Users}
              label="Members"
              onClick={() => chooseSection("analytics")}
            />
          </div>
        </nav>

        <div className="mt-7 border-t border-[#E6E6E9] pt-6">
          <div className="mb-4 flex items-center justify-between px-2.5">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#A1A1AA]">
              Projects
            </p>
            <button
              className="grid size-6 place-items-center rounded-[0.5rem] text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#111111]"
              onClick={() => chooseSection("projects")}
              type="button"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <button
            className={`flex h-10 w-full items-center gap-2.5 rounded-[0.75rem] px-2.5 text-left text-sm font-semibold transition-colors ${
              activeSection === "projects"
                ? "bg-[#EFF6FF] text-[#007AFF]"
                : "text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#111111]"
            }`}
            onClick={() => chooseSection("projects")}
            type="button"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-[0.55rem] bg-[#F4F4F5] text-[0.68rem] font-semibold text-[#64748B]">
              SU
            </span>
            <span className="truncate">Setting up codebases</span>
          </button>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-4">
        <div className="flex items-center gap-2.5 rounded-[0.85rem] border border-[#E4E4E7] bg-white px-2.5 py-2.5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.45)]">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#030712] text-sm font-semibold text-white">
            A
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold leading-5 text-[#111111]">
              Amiel Brencis ...
            </span>
            <span className="mt-0.5 block text-xs leading-4 text-[#71717A]">
              Signed in
            </span>
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-[#71717A]" />
        </div>
      </div>
    </aside>
  );
}

function ProductionSidebarAction({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex h-10 w-full items-center gap-2.5 rounded-[0.8rem] px-2.5 text-left text-sm font-semibold transition-colors ${
        active
          ? "bg-[#EFF6FF] text-[#007AFF]"
          : "text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#111111]"
      }`}
      onClick={onClick}
      type="button"
    >
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-[0.55rem] ${
          active ? "text-[#007AFF]" : "text-[#71717A]"
        }`}
      >
        <Icon className="size-4" />
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function IconRail({
  activeSection,
  chooseSection,
  expand,
}: {
  activeSection: SectionKey;
  chooseSection: (section: SectionKey) => void;
  expand: () => void;
}) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-[#EEF2F7] bg-[#FBFCFE]">
      <div className="grid h-14 place-items-center border-b border-[#EEF2F7]">
        <button
          className="grid size-8 place-items-center rounded-[0.65rem] bg-white ring-1 ring-[#E6EAF0]"
          onClick={expand}
          title="Expand main sidebar"
          type="button"
        >
          <Menu className="size-3.5 text-[#007AFF]" />
        </button>
      </div>
      <nav className="flex flex-1 flex-col items-center gap-1.5 py-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`grid size-8 place-items-center rounded-[0.65rem] transition-colors ${
              activeSection === item.key
                ? "bg-[#EFF6FF] text-[#007AFF]"
                : "text-[#71717A] hover:bg-[#F4F4F5]"
            }`}
            onClick={() => chooseSection(item.key)}
            title={item.label}
            type="button"
          >
            <item.icon className="size-3.5" />
          </button>
        ))}
      </nav>
      <div className="grid h-14 place-items-center border-t border-[#EEF2F7]">
        <span className="grid size-7 place-items-center rounded-full bg-[#111111] text-[0.68rem] font-semibold text-white">
          A
        </span>
      </div>
    </aside>
  );
}

function ContextSidebar({
  active,
  activeNav,
  collapsed,
}: {
  active: (typeof sectionContent)[SectionKey];
  activeNav: NavItem;
  collapsed: boolean;
}) {
  return (
    <aside
      className={`min-h-0 overflow-hidden border-r border-[#EEF2F7] bg-white transition-opacity duration-300 ${
        collapsed ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex h-14 items-center gap-2.5 border-b border-[#EEF2F7] px-3">
        <span className="grid size-8 place-items-center rounded-[0.65rem] bg-[#EFF6FF] text-[#007AFF]">
          <activeNav.icon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{active.title}</span>
          <span className="text-[0.68rem] font-medium text-[#94A3B8]">
            {active.eyebrow}
          </span>
        </span>
      </div>

      <div className="p-3">
        <div className="flex h-8 items-center gap-2 rounded-[0.6rem] border border-[#E7ECF3] px-2 text-xs text-[#94A3B8]">
          <Search className="size-3.5" />
          Search this section
        </div>

        <div className="mt-4 space-y-1">
          {active.channels.map((channel, index) => (
            <button
              key={channel.label}
              className={`flex h-9 w-full items-center gap-2 rounded-[0.65rem] px-2 text-left text-xs font-semibold transition-colors ${
                index === 0
                  ? "bg-[#EFF6FF] text-[#007AFF]"
                  : "text-[#52525B] hover:bg-[#F4F4F5]"
              }`}
              type="button"
            >
              <channel.icon className="size-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{channel.label}</span>
              {channel.count ? (
                <span className="text-[0.68rem] text-[#94A3B8]">{channel.count}</span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-5 border-t border-[#EEF2F7] pt-4">
          <p className="px-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#A1A1AA]">
            Team
          </p>
          <div className="mt-2 space-y-1.5">
            {["Alex", "Nora", "Sam"].map((name) => (
              <div
                key={name}
                className="flex h-8 items-center gap-2 rounded-[0.6rem] px-2 text-xs font-semibold text-[#64748B]"
              >
                <span className="grid size-6 place-items-center rounded-full bg-[#F4F7FA] text-[0.62rem] text-[#007AFF]">
                  {name[0]}
                </span>
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function WorkspaceCanvas({
  active,
  activeSection,
  collapse,
  openInspector,
}: {
  active: (typeof sectionContent)[SectionKey];
  activeSection: SectionKey;
  collapse: () => void;
  openInspector: (item: SelectedItem) => void;
}) {
  return (
    <section className="min-h-0 min-w-0 bg-white">
      <div className="flex h-14 items-center gap-3 border-b border-[#EEF2F7] px-4">
        <button
          className="grid size-8 place-items-center rounded-[0.65rem] text-[#71717A] transition-colors hover:bg-[#F4F4F5] lg:hidden"
          onClick={collapse}
          type="button"
        >
          <Menu className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{active.title}</p>
          <p className="text-[0.68rem] text-[#94A3B8]">
            Discord-like navigation model for Relay
          </p>
        </div>
        <div className="hidden h-8 w-[260px] items-center gap-2 rounded-[0.65rem] border border-[#E7ECF3] px-2.5 text-xs text-[#94A3B8] md:flex">
          <Search className="size-3.5" />
          Search workspace
        </div>
        <button className="inline-flex h-8 items-center gap-1.5 rounded-[0.65rem] bg-[#007AFF] px-3 text-xs font-semibold text-white">
          <Plus className="size-3.5" />
          Create
        </button>
      </div>

      <div className="app-content-scrollbar h-[calc(100%-3.5rem)] overflow-y-auto p-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <MetricCard
            label="Ready tasks"
            onClick={() =>
              openInspector({ meta: active.title, title: "Ready tasks" })
            }
            value="12"
          />
          <MetricCard
            label="In review"
            onClick={() =>
              openInspector({ meta: active.title, title: "In review" })
            }
            value="5"
          />
          <MetricCard
            label="Blocked"
            onClick={() =>
              openInspector({ meta: active.title, title: "Blocked tasks" })
            }
            tone="amber"
            value="3"
          />
        </div>

        <div className="mt-4 rounded-[0.85rem] border border-[#E7ECF3] bg-white">
          <div className="flex items-center justify-between border-b border-[#EEF2F7] px-4 py-3">
            <div>
              <p className="text-sm font-semibold">
                {activeSection === "projects" ? "Launch project" : "Workspace work queue"}
              </p>
              <p className="text-xs text-[#94A3B8]">
                Main canvas changes while the rail context stays nearby.
              </p>
            </div>
            <MoreHorizontal className="size-4 text-[#94A3B8]" />
          </div>
          <div className="divide-y divide-[#EEF2F7]">
            {tasks.map(([title, project, status]) => (
              <button
                key={title}
                className="grid w-full grid-cols-[minmax(0,1fr)_90px_92px] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F8FAFC]"
                onClick={() => openInspector({ meta: project, title })}
                type="button"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{title}</p>
                  <p className="mt-0.5 text-xs text-[#94A3B8]">{project}</p>
                </div>
                <span className="rounded-[0.55rem] bg-[#F8FAFC] px-2 py-1 text-center text-xs font-semibold text-[#64748B]">
                  {project}
                </span>
                <span className="rounded-[0.55rem] bg-[#EFF6FF] px-2 py-1 text-center text-xs font-semibold text-[#007AFF]">
                  {status}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-[0.85rem] border border-[#E7ECF3] p-4">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles className="size-4 text-[#007AFF]" />
              Why this layout works
            </p>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              The far-left rail behaves like Discord&apos;s server rail: stable,
              compact, and always available. The second sidebar becomes the
              selected section&apos;s channel list. The main canvas stays focused
              on work, while the right panel can inspect or summarize context.
            </p>
          </div>
          <div className="rounded-[0.85rem] border border-[#E7ECF3] p-4">
            <p className="text-sm font-semibold">Current state</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[#007AFF]">
              {active.title}
            </p>
            <p className="mt-2 text-xs leading-5 text-[#64748B]">
              Click another item in the main sidebar or icon rail to swap the
              contextual sidebar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Inspector({
  active,
  activeSection,
  onClose,
  open,
  selectedItem,
}: {
  active: (typeof sectionContent)[SectionKey];
  activeSection: SectionKey;
  onClose: () => void;
  open: boolean;
  selectedItem: SelectedItem;
}) {
  const [tab, setTab] = useState<InspectorTab>("details");

  return (
    <aside
      className={`hidden min-h-0 min-w-0 overflow-hidden border-l border-[#EEF2F7] bg-[#FBFCFE] transition-opacity duration-300 lg:flex lg:flex-col ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex h-14 items-center gap-2 border-b border-[#EEF2F7] px-3">
        <div className="grid h-9 flex-1 grid-cols-2 rounded-[0.72rem] bg-[#F1F5F9] p-1 text-xs font-semibold">
          <button
            className={`rounded-[0.55rem] transition-colors ${
              tab === "details"
                ? "bg-white text-[#111111] shadow-[0_6px_16px_-14px_rgba(15,23,42,0.7)]"
                : "text-[#64748B] hover:text-[#111111]"
            }`}
            onClick={() => setTab("details")}
            type="button"
          >
            Details
          </button>
          <button
            className={`rounded-[0.55rem] transition-colors ${
              tab === "ai"
                ? "bg-white text-[#111111] shadow-[0_6px_16px_-14px_rgba(15,23,42,0.7)]"
                : "text-[#64748B] hover:text-[#111111]"
            }`}
            onClick={() => setTab("ai")}
            type="button"
          >
            AI chat
          </button>
        </div>
        <button
          className="grid size-9 shrink-0 place-items-center rounded-[0.65rem] text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#111111]"
          onClick={onClose}
          type="button"
          aria-label="Close details panel"
        >
          <X className="size-4" />
        </button>
      </div>

      {tab === "details" ? (
        <DetailsPanel
          active={active}
          activeSection={activeSection}
          selectedItem={selectedItem}
        />
      ) : (
        <AiChatPanel active={active} selectedItem={selectedItem} />
      )}
    </aside>
  );
}

function DetailsPanel({
  active,
  activeSection,
  selectedItem,
}: {
  active: (typeof sectionContent)[SectionKey];
  activeSection: SectionKey;
  selectedItem: SelectedItem;
}) {
  return (
    <div className="app-content-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
      <div className="flex h-10 items-center gap-2 rounded-[0.7rem] border border-[#E7ECF3] bg-white px-3 text-xs text-[#94A3B8] shadow-[0_12px_28px_-26px_rgba(15,23,42,0.7)]">
        <Search className="size-3.5" />
        Find or replace
      </div>

      <div className="mt-4 rounded-[0.85rem] border border-[#E7ECF3] bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{selectedItem.title}</p>
            <p className="mt-1 text-xs leading-5 text-[#64748B]">
              A persistent right panel for selected work, shaped like the
              transcript/details area in the reference.
            </p>
          </div>
          <span className="grid size-8 shrink-0 place-items-center rounded-[0.65rem] bg-[#EFF6FF] text-[#007AFF]">
            <Sparkles className="size-4" />
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <DetailRow label="Selected item" value={selectedItem.title} />
        <DetailRow label="Context" value={selectedItem.meta} />
        <DetailRow label="Selected section" value={active.title} />
        <DetailRow label="Mode" value={activeSection === "home" ? "Workspace" : "Context rail"} />
        <DetailRow label="Owner" value="Alex Rivera" />
        <DetailRow label="Status" value="In progress" />
      </div>

      <div className="mt-4 rounded-[0.85rem] border border-[#E7ECF3] bg-white p-4">
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles className="size-4 text-[#007AFF]" />
          Relay summary
        </p>
        <p className="mt-2 text-xs leading-5 text-[#64748B]">
          Relay keeps the details close to the work surface. When a task,
          project, or channel is selected, this panel can show description,
          checklist, comments, activity, and field updates without navigating
          away.
        </p>
      </div>

      <div className="mt-4 rounded-[0.85rem] border border-[#E7ECF3] bg-white">
        <div className="border-b border-[#EEF2F7] px-4 py-3">
          <p className="text-sm font-semibold">Activity</p>
        </div>
        <div className="divide-y divide-[#EEF2F7]">
          {[
            ["Nora", "Updated release notes", "00:14"],
            ["Sam", "Flagged API dependency", "00:36"],
            ["Alex", "Assigned beta feedback", "01:03"],
          ].map(([name, body, time]) => (
            <div key={time} className="flex gap-3 px-4 py-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#EFF6FF] text-[0.68rem] font-semibold text-[#007AFF]">
                {name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold">{name}</p>
                  <span className="text-[0.68rem] font-semibold text-[#D97706]">
                    {time}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[#64748B]">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AiChatPanel({
  active,
  selectedItem,
}: {
  active: (typeof sectionContent)[SectionKey];
  selectedItem: SelectedItem;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-[#EEF2F7] p-4">
        <div className="rounded-[0.85rem] border border-[#E7ECF3] bg-white p-4">
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
            <Bot className="size-4 text-[#007AFF]" />
            Ask about {selectedItem.title.toLowerCase()}
          </p>
          <p className="mt-2 text-xs leading-5 text-[#64748B]">
            Relay can summarize context, draft updates, or turn activity into
            owner-ready tasks inside {active.title.toLowerCase()}.
          </p>
        </div>
      </div>

      <div className="app-content-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <ChatBubble
          body="What changed since the last project review?"
          name="You"
          self
        />
        <ChatBubble
          body="The main change is that release blockers moved from planning into active review. The API dependency is still the highest-risk item."
          name="Relay AI"
        />
        <ChatBubble
          body="Can you draft a short status update?"
          name="You"
          self
        />
        <ChatBubble
          body="Draft ready: Platform release is progressing, with customer notes prepared and beta feedback moving through triage. The only material risk is the API dependency."
          name="Relay AI"
        />
      </div>

      <div className="border-t border-[#EEF2F7] bg-white p-3">
        <div className="flex min-h-11 items-center gap-2 rounded-[0.85rem] border border-[#E7ECF3] bg-[#FBFCFE] px-3">
          <Plus className="size-3.5 text-[#94A3B8]" />
          <span className="min-w-0 flex-1 text-xs text-[#94A3B8]">
            Ask anything about this context...
          </span>
          <button
            className="grid size-8 place-items-center rounded-[0.65rem] bg-[#007AFF] text-white"
            type="button"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[0.75rem] border border-[#E7ECF3] bg-white px-3 py-2.5">
      <span className="text-xs font-medium text-[#64748B]">{label}</span>
      <span className="truncate text-xs font-semibold text-[#111111]">{value}</span>
    </div>
  );
}

function ChatBubble({
  body,
  name,
  self,
}: {
  body: string;
  name: string;
  self?: boolean;
}) {
  return (
    <div className={`flex gap-2 ${self ? "justify-end" : ""}`}>
      {!self ? (
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#EFF6FF] text-[0.68rem] font-semibold text-[#007AFF]">
          R
        </span>
      ) : null}
      <div
        className={`max-w-[82%] rounded-[0.85rem] px-3 py-2.5 ${
          self
            ? "bg-[#007AFF] text-white"
            : "border border-[#E7ECF3] bg-white text-[#111111]"
        }`}
      >
        <p className={`text-[0.68rem] font-semibold ${self ? "text-white/75" : "text-[#94A3B8]"}`}>
          {name}
        </p>
        <p className="mt-1 text-xs leading-5">{body}</p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  onClick,
  tone = "blue",
  value,
}: {
  label: string;
  onClick: () => void;
  tone?: "amber" | "blue";
  value: string;
}) {
  return (
    <button
      className="rounded-[0.85rem] border border-[#E7ECF3] bg-white p-4 text-left transition-colors hover:bg-[#F8FAFC]"
      onClick={onClick}
      type="button"
    >
      <span
        className={`grid size-8 place-items-center rounded-[0.65rem] ${
          tone === "amber"
            ? "bg-[#FFFBEB] text-[#D97706]"
            : "bg-[#EFF6FF] text-[#007AFF]"
        }`}
      >
        <Activity className="size-4" />
      </span>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs font-medium text-[#64748B]">{label}</p>
    </button>
  );
}
