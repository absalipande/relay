import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Copy,
  FolderKanban,
  Home,
  ListTodo,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Search,
  Share2,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const meetings = [
  ["Sprint planning", "09:30 AM", "34 min", "Nora", "blue"],
  ["Release readiness", "11:15 AM", "22 min", "Sam", "green"],
  ["Product team standup", "02:00 PM", "18 min", "Alex", "blue"],
  ["Workflow review", "03:30 PM", "29 min", "Maya", "amber"],
  ["Design handoff", "05:10 PM", "16 min", "Olivia", "violet"],
];

const tasks = [
  ["Finalize onboarding checklist", "Launch", "done"],
  ["Review sprint blockers", "Platform", "progress"],
  ["Draft customer update", "CX", "todo"],
  ["Triage beta feedback", "Mobile", "progress"],
];

const transcript = [
  ["Alex", "00:14", "We should separate launch blockers from follow-up polish before the status note goes out."],
  ["Sam", "00:36", "The API dependency is the main risk. Everything else can move through normal review."],
  ["Nora", "00:52", "I will turn those notes into owner-ready tasks and attach them to the release project."],
];

export function RelayMotionDemo() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F7FAFC] text-[#111111]">
      <section className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex h-12 shrink-0 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/relay-logo.svg"
              alt=""
              width={36}
              height={36}
              className="h-8 w-auto"
              priority
            />
            <div>
              <p className="text-sm font-semibold tracking-tight">relay</p>
              <p className="text-[0.68rem] font-medium text-[#64748B]">
                Motion layout prototype
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-[0.6rem] border border-[#E4E7EC] bg-white px-3 py-1.5 text-xs font-semibold text-[#334155] shadow-[0_16px_36px_-30px_rgba(15,23,42,0.55)] transition-colors hover:bg-[#F8FAFC]"
          >
            Back to Relay
          </Link>
        </header>

        <div className="relay-motion-stage relative min-h-0 flex-1">
          <DesktopFrame />
          <MobileHome />
          <MobileDetail />
          <MobileAnalytics />
        </div>
      </section>
      <RelayMotionStyles />
    </main>
  );
}

function DesktopFrame() {
  return (
    <div className="relay-desktop-shot absolute inset-x-0 mx-auto grid h-[min(690px,calc(100vh-7rem))] max-h-[690px] w-full max-w-[1080px] grid-cols-[220px_minmax(0,1fr)_286px] overflow-hidden rounded-[1.15rem] border border-[#E7ECF3] bg-white shadow-[0_42px_100px_-70px_rgba(15,23,42,0.55)]">
      <aside className="min-h-0 border-r border-[#EEF2F7] bg-white">
        <div className="flex h-14 items-center gap-2.5 border-b border-[#F1F5F9] px-3.5">
          <button className="grid size-7 place-items-center rounded-[0.55rem] text-[#64748B] hover:bg-[#F4F7FA]">
            <PanelLeft className="size-3.5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Vision Room</p>
            <p className="text-[0.68rem] text-[#94A3B8]">Workspace</p>
          </div>
        </div>

        <nav className="space-y-1 px-3 py-3">
          <RailItem active icon={Home} label="Home" />
          <RailItem icon={ListTodo} label="Tasks" />
          <RailItem icon={FolderKanban} label="Projects" />
          <RailItem icon={BarChart3} label="Analytics" />
          <RailItem icon={Bot} label="AI apps" />
        </nav>

        <div className="mx-3 mt-3 rounded-[0.8rem] border border-[#E8EDF4] bg-[#FBFCFE] p-3">
          <div className="flex items-center justify-between">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
              Projects
            </p>
            <Plus className="size-3.5 text-[#007AFF]" />
          </div>
          <div className="mt-2 space-y-1.5">
            <ProjectRow name="Launch" value="14" />
            <ProjectRow name="Platform" value="8" />
            <ProjectRow name="Mobile" value="6" />
          </div>
        </div>

        <div className="mx-3 mt-3 rounded-[0.8rem] border border-[#E8EDF4] bg-white p-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
            Health
          </p>
          <MetricLine label="Completed" value="72%" />
          <MetricLine label="In review" value="18%" />
          <MetricLine label="At risk" value="10%" />
        </div>
      </aside>

      <section className="min-h-0 bg-white">
        <div className="flex h-14 items-center gap-3 border-b border-[#F1F5F9] px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="grid size-7 place-items-center rounded-[0.55rem] bg-[#EFF6FF] text-[#007AFF]">
              <ClipboardList className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Workspace home</p>
              <p className="text-[0.68rem] text-[#94A3B8]">Tasks, status, and context</p>
            </div>
          </div>
          <div className="hidden h-8 min-w-[250px] items-center gap-2 rounded-[0.65rem] border border-[#E7ECF3] px-2.5 text-xs text-[#94A3B8] md:flex">
            <Search className="size-3.5" />
            Search tasks or projects
          </div>
          <button className="grid size-8 place-items-center rounded-[0.65rem] border border-[#E7ECF3] text-[#64748B]">
            <Bell className="size-3.5" />
          </button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-[0.65rem] bg-[#007AFF] px-3 text-xs font-semibold text-white">
            <Plus className="size-3.5" />
            Create
          </button>
        </div>

        <div className="relay-desktop-main app-content-scrollbar h-[calc(100%-3.5rem)] overflow-hidden px-5 py-4">
          <div className="relay-list-scene">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
                  Today
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                  Product delivery
                </h1>
              </div>
              <div className="flex rounded-[0.65rem] bg-[#F4F7FA] p-1">
                <span className="rounded-[0.5rem] bg-white px-2.5 py-1 text-xs font-semibold text-[#007AFF] shadow-sm">
                  Hosted by me
                </span>
                <span className="px-2.5 py-1 text-xs font-semibold text-[#64748B]">
                  Shared
                </span>
              </div>
            </div>
            <div className="space-y-2.5">
              {meetings.map(([name, time, duration, owner, color], index) => (
                <MeetingRow
                  key={name}
                  color={color}
                  duration={duration}
                  index={index}
                  name={name}
                  owner={owner}
                  time={time}
                />
              ))}
            </div>
          </div>

          <div className="relay-detail-scene">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
                  Product team standup
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">
                  Release readiness and blockers
                </h2>
              </div>
              <button className="inline-flex h-8 items-center gap-1.5 rounded-[0.65rem] border border-[#E7ECF3] bg-white px-2.5 text-xs font-semibold text-[#334155]">
                <Share2 className="size-3.5" />
                Share
              </button>
            </div>

            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px]">
              <div className="rounded-[0.8rem] border border-[#E7ECF3] bg-white p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                  <span className="font-semibold text-[#111111]">Wed, 21 May</span>
                  <span>09:15 to 10:02</span>
                  <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />
                  <span>Audio 05:12</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ShareChip icon={Mail} label="Email" />
                  <ShareChip icon={Copy} label="Copy link" />
                  <ShareChip icon={Sparkles} label="Status draft" />
                </div>

                <div className="mt-5 border-t border-[#F1F5F9] pt-4">
                  <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold">
                    <Sparkles className="size-3.5 text-[#007AFF]" />
                    General summary
                  </p>
                  <h3 className="text-sm font-semibold">
                    Platform release coordination
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#64748B]">
                    The team aligned on launch blockers, customer-facing notes,
                    and ownership for release follow-up. Relay grouped decisions
                    into tasks so the workspace can move without another recap.
                  </p>
                  <ul className="mt-3 space-y-2 text-xs leading-5 text-[#475569]">
                    <SummaryBullet text="API dependency remains the primary launch risk." />
                    <SummaryBullet text="Beta feedback should be triaged before Friday review." />
                    <SummaryBullet text="Customer update draft is ready for owner review." />
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <InsightCard label="Ready tasks" value="12" tone="blue" />
                <InsightCard label="Blocked" value="3" tone="amber" />
                <InsightCard label="Due this week" value="8" tone="green" />
              </div>
            </div>

            <div className="mt-3 grid gap-2">
              {tasks.map(([title, project, status]) => (
                <TaskStrip
                  key={title}
                  project={project}
                  status={status}
                  title={title}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <aside className="relay-context-panel min-h-0 border-l border-[#EEF2F7] bg-[#FBFCFE]">
        <div className="flex h-14 items-center justify-between border-b border-[#F1F5F9] px-4">
          <div>
            <p className="text-sm font-semibold">Relay context</p>
            <p className="text-[0.68rem] text-[#94A3B8]">Summary and transcript</p>
          </div>
          <MoreHorizontal className="size-4 text-[#94A3B8]" />
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 rounded-[0.65rem] bg-[#EEF2F7] p-1 text-xs font-semibold">
            <span className="rounded-[0.5rem] bg-white px-2 py-1 text-center text-[#007AFF] shadow-sm">
              Transcript
            </span>
            <span className="px-2 py-1 text-center text-[#64748B]">Ask AI</span>
          </div>
          <div className="mt-3 space-y-3">
            {transcript.map(([name, time, body]) => (
              <div key={time} className="rounded-[0.75rem] bg-white p-3 ring-1 ring-[#E7ECF3]">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-[#EFF6FF] text-[0.65rem] font-semibold text-[#007AFF]">
                    {name.slice(0, 1)}
                  </span>
                  <span className="text-xs font-semibold">{name}</span>
                  <span className="ml-auto text-[0.68rem] font-semibold text-[#94A3B8]">
                    {time}
                  </span>
                </div>
                <p className="text-xs leading-5 text-[#64748B]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function MobileHome() {
  return (
    <div className="relay-mobile-shot relay-mobile-home absolute w-[320px] overflow-hidden rounded-[2rem] border border-[#E4E7EC] bg-white shadow-[0_42px_100px_-66px_rgba(15,23,42,0.7)]">
      <MobileChrome title="Good morning, Marcel!" />
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 rounded-[0.75rem] bg-[#F4F7FA] p-1 text-[0.68rem] font-semibold">
          <span className="rounded-[0.58rem] bg-white py-1.5 text-center text-[#111111] shadow-sm">All Tasks</span>
          <span className="py-1.5 text-center text-[#64748B]">My Tasks</span>
          <span className="py-1.5 text-center text-[#64748B]">Resources</span>
        </div>
        <div className="mt-3 space-y-2">
          <MobileStatusRow label="Product Development" value="Completed" />
          <MobileStatusRow label="Feature Optimization" value="6/10 tasks" />
          <MobileStatusRow label="Workflow Planning" value="4/7 tasks" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <MobileTile icon={Sparkles} label="Daily digest" value="4 / 12" />
          <MobileTile icon={MessageSquareText} label="Meeting prep" value="2 / 8" />
        </div>
        <div className="mt-4 flex items-center justify-between text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-[#007AFF]" />
            Relay workflows
          </span>
          <span className="text-[#94A3B8]">Demo</span>
        </div>
        <div className="mt-2 space-y-2">
          <WorkflowRow label="Release digest" enabled />
          <WorkflowRow label="Feature tracker" />
          <WorkflowRow label="Action extraction" enabled />
        </div>
      </div>
      <MobileNav active="Home" />
    </div>
  );
}

function MobileDetail() {
  return (
    <div className="relay-mobile-shot relay-mobile-detail absolute w-[320px] overflow-hidden rounded-[2rem] border border-[#E4E7EC] bg-white shadow-[0_42px_100px_-66px_rgba(15,23,42,0.7)]">
      <MobileChrome title="Product team standup" compact />
      <div className="px-4 pb-4">
        <p className="text-sm font-semibold">Product team standup</p>
        <div className="mt-3 grid grid-cols-[58px_minmax(0,1fr)] gap-y-2 text-xs">
          <span className="text-[#94A3B8]">Created</span>
          <span className="font-semibold">Wed, 21 May, 09:15 to 10:02</span>
          <span className="text-[#94A3B8]">Meeting</span>
          <span>Product Development Review</span>
          <span className="text-[#94A3B8]">Audio</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 flex-1 rounded-full bg-[#E2E8F0]">
              <span className="block h-full w-1/3 rounded-full bg-[#007AFF]" />
            </span>
            05:12
          </span>
        </div>
        <div className="mt-3 flex gap-1.5">
          <ShareChip icon={Mail} label="Email" />
          <ShareChip icon={Copy} label="Link" />
          <ShareChip icon={Sparkles} label="Draft" />
        </div>
        <div className="mt-4 grid grid-cols-2 rounded-[0.75rem] bg-[#F4F7FA] p-1 text-xs font-semibold">
          <span className="rounded-[0.58rem] bg-white py-1.5 text-center text-[#007AFF] shadow-sm">Summary</span>
          <span className="py-1.5 text-center text-[#64748B]">Transcript</span>
        </div>
        <div className="mt-3 rounded-[0.8rem] border border-[#E7ECF3] p-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold">
            <Sparkles className="size-3.5 text-[#007AFF]" />
            General summary
          </p>
          <h3 className="mt-2 text-sm font-semibold leading-5">
            Platform release coordination
          </h3>
          <p className="mt-2 text-xs leading-5 text-[#64748B]">
            Relay captured blockers, owners, and the next customer update from
            the team discussion.
          </p>
        </div>
      </div>
      <div className="mx-4 mb-4 flex h-10 items-center gap-2 rounded-[0.85rem] border border-[#E7ECF3] px-2 text-xs text-[#94A3B8]">
        <Plus className="size-3.5" />
        Ask anything...
        <span className="ml-auto grid size-7 place-items-center rounded-[0.6rem] bg-[#007AFF] text-white">
          <Zap className="size-3.5" />
        </span>
      </div>
    </div>
  );
}

function MobileAnalytics() {
  return (
    <div className="relay-mobile-shot relay-mobile-analytics absolute w-[320px] overflow-hidden rounded-[2rem] border border-[#E4E7EC] bg-white shadow-[0_42px_100px_-66px_rgba(15,23,42,0.7)]">
      <MobileChrome title="Analytics" />
      <div className="px-4 pb-4">
        <p className="mb-2 text-xs font-semibold text-[#334155]">Average development progress</p>
        <div className="grid grid-cols-3 gap-2">
          <AnalyticsBox label="Completed" value="72%" />
          <AnalyticsBox label="In review" value="18%" />
          <AnalyticsBox label="Pending" value="10%" />
        </div>
        <p className="mb-2 mt-4 text-xs font-semibold text-[#334155]">Team collaboration status</p>
        <div className="grid grid-cols-3 gap-2">
          <AnalyticsBox label="Efficient" value="31%" />
          <AnalyticsBox label="Delayed" value="9%" />
          <AnalyticsBox label="Stable" value="60%" />
        </div>
        <p className="mb-2 mt-4 text-xs font-semibold text-[#334155]">Talk to delivery ratio</p>
        <div className="space-y-2">
          <RatioRow name="Alex" talk="72" />
          <RatioRow name="Sam" talk="65" />
          <RatioRow name="Grace" talk="58" />
        </div>
      </div>
      <MobileNav active="Analytics" />
    </div>
  );
}

function RailItem({
  active,
  icon: Icon,
  label,
}: {
  active?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span
      className={`flex h-9 items-center gap-2 rounded-[0.7rem] px-2.5 text-xs font-semibold ${
        active
          ? "bg-[#EFF6FF] text-[#007AFF]"
          : "text-[#64748B] hover:bg-[#F4F7FA]"
      }`}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

function ProjectRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex h-7 items-center justify-between rounded-[0.55rem] px-2 text-xs font-semibold text-[#475569]">
      <span>{name}</span>
      <span className="text-[#94A3B8]">{value}</span>
    </div>
  );
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2 flex items-center gap-2 text-xs">
      <span className="w-16 text-[#64748B]">{label}</span>
      <span className="h-1.5 flex-1 rounded-full bg-[#E2E8F0]">
        <span className="block h-full rounded-full bg-[#007AFF]" style={{ width: value }} />
      </span>
      <span className="w-8 text-right font-semibold text-[#334155]">{value}</span>
    </div>
  );
}

function MeetingRow({
  color,
  duration,
  index,
  name,
  owner,
  time,
}: {
  color: string;
  duration: string;
  index: number;
  name: string;
  owner: string;
  time: string;
}) {
  const colorClass =
    color === "green"
      ? "bg-[#ECFDF3] text-[#16A34A]"
      : color === "amber"
        ? "bg-[#FFFBEB] text-[#D97706]"
        : color === "violet"
          ? "bg-[#F5F3FF] text-[#6D5DF6]"
          : "bg-[#EFF6FF] text-[#007AFF]";

  return (
    <div
      className="relay-meeting-row flex min-h-14 items-center gap-3 rounded-[0.85rem] border border-[#E7ECF3] bg-white px-3 shadow-[0_18px_40px_-36px_rgba(15,23,42,0.45)]"
      style={{ "--relay-row": index } as React.CSSProperties}
    >
      <span className={`grid size-9 place-items-center rounded-[0.7rem] ${colorClass}`}>
        <CalendarDays className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="mt-0.5 text-xs text-[#94A3B8]">
          {time} - {duration} - {owner}
        </p>
      </div>
      <MoreHorizontal className="size-4 text-[#CBD5E1]" />
    </div>
  );
}

function ShareChip({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-[0.55rem] border border-[#E7ECF3] bg-white px-2 text-[0.68rem] font-semibold text-[#475569]">
      <Icon className="size-3" />
      {label}
    </span>
  );
}

function SummaryBullet({ text }: { text: string }) {
  return (
    <li className="flex gap-2">
      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#16A34A]" />
      <span>{text}</span>
    </li>
  );
}

function InsightCard({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "amber" | "blue" | "green";
  value: string;
}) {
  const toneClass =
    tone === "green"
      ? "bg-[#ECFDF3] text-[#16A34A]"
      : tone === "amber"
        ? "bg-[#FFFBEB] text-[#D97706]"
        : "bg-[#EFF6FF] text-[#007AFF]";

  return (
    <div className="rounded-[0.8rem] border border-[#E7ECF3] bg-white p-3">
      <span className={`grid size-8 place-items-center rounded-[0.65rem] ${toneClass}`}>
        <Activity className="size-4" />
      </span>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs font-medium text-[#64748B]">{label}</p>
    </div>
  );
}

function TaskStrip({
  project,
  status,
  title,
}: {
  project: string;
  status: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[0.75rem] border border-[#E7ECF3] bg-white px-3 py-2.5">
      <span
        className={`grid size-7 place-items-center rounded-[0.55rem] ${
          status === "done"
            ? "bg-[#ECFDF3] text-[#16A34A]"
            : status === "progress"
              ? "bg-[#EFF6FF] text-[#007AFF]"
              : "bg-[#F8FAFC] text-[#64748B]"
        }`}
      >
        <CheckCircle2 className="size-3.5" />
      </span>
      <p className="min-w-0 flex-1 truncate text-xs font-semibold">{title}</p>
      <span className="rounded-[0.5rem] bg-[#F8FAFC] px-2 py-1 text-[0.68rem] font-semibold text-[#64748B]">
        {project}
      </span>
    </div>
  );
}

function MobileChrome({
  compact,
  title,
}: {
  compact?: boolean;
  title: string;
}) {
  return (
    <div className="px-4 pt-4">
      <div className="flex h-7 items-center justify-between text-[0.68rem] font-semibold">
        <span>9:41</span>
        <span className="h-5 w-20 rounded-full bg-[#EEF2F7]" />
        <span>5G</span>
      </div>
      <div className="flex h-14 items-center justify-between">
        <button className="grid size-9 place-items-center rounded-[0.75rem] border border-[#E7ECF3] text-[#64748B]">
          {compact ? <PanelLeft className="size-4" /> : <Home className="size-4" />}
        </button>
        <p className="text-sm font-semibold">{title}</p>
        <button className="grid size-9 place-items-center rounded-[0.75rem] border border-[#E7ECF3] text-[#64748B]">
          {compact ? <MoreHorizontal className="size-4" /> : <UserRound className="size-4" />}
        </button>
      </div>
    </div>
  );
}

function MobileStatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-10 items-center justify-between rounded-[0.75rem] border border-[#E7ECF3] px-3 text-xs">
      <span className="font-semibold">{label}</span>
      <span className="font-semibold text-[#007AFF]">{value}</span>
    </div>
  );
}

function MobileTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[0.85rem] border border-[#E7ECF3] p-3">
      <span className="grid size-8 place-items-center rounded-[0.65rem] bg-[#EFF6FF] text-[#007AFF]">
        <Icon className="size-4" />
      </span>
      <p className="mt-3 text-xs font-semibold">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
      <span className="mt-1 block h-1.5 rounded-full bg-[#E2E8F0]">
        <span className="block h-full w-1/3 rounded-full bg-[#007AFF]" />
      </span>
    </div>
  );
}

function WorkflowRow({ enabled, label }: { enabled?: boolean; label: string }) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-[0.75rem] border border-[#EEF2F7] px-3">
      <span className="grid size-7 place-items-center rounded-[0.55rem] bg-[#EFF6FF] text-[#007AFF]">
        <Sparkles className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-xs font-semibold">{label}</span>
      <span
        className={`h-5 w-9 rounded-full p-0.5 ${
          enabled ? "bg-[#CDE7FF]" : "bg-[#E2E8F0]"
        }`}
      >
        <span
          className={`block size-4 rounded-full bg-white shadow-sm ${
            enabled ? "translate-x-4" : ""
          }`}
        />
      </span>
    </div>
  );
}

function MobileNav({ active }: { active: "Analytics" | "Home" }) {
  const items = [
    [Home, "Home"],
    [ListTodo, "Tasks"],
    [BarChart3, "Analytics"],
    [Bot, "AI Apps"],
  ] as const;

  return (
    <div className="grid h-14 grid-cols-4 border-t border-[#EEF2F7] px-4">
      {items.map(([Icon, label]) => (
        <span
          key={label}
          className={`grid place-items-center text-[0.62rem] font-semibold ${
            label === active ? "text-[#007AFF]" : "text-[#94A3B8]"
          }`}
        >
          <Icon className="mb-0.5 size-4" />
          {label}
        </span>
      ))}
    </div>
  );
}

function AnalyticsBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[0.8rem] border border-[#E7ECF3] p-2.5 text-center">
      <span className="mx-auto mb-2 grid size-7 place-items-center rounded-[0.55rem] bg-[#EFF6FF] text-[#007AFF]">
        <BarChart3 className="size-3.5" />
      </span>
      <p className="text-lg font-semibold tracking-tight">{value}</p>
      <p className="text-[0.65rem] font-medium text-[#64748B]">{label}</p>
    </div>
  );
}

function RatioRow({ name, talk }: { name: string; talk: string }) {
  return (
    <div className="flex items-center gap-2 rounded-[0.7rem] border border-[#EEF2F7] px-2.5 py-2 text-xs">
      <span className="grid size-6 place-items-center rounded-full bg-[#EFF6FF] text-[0.65rem] font-semibold text-[#007AFF]">
        {name.slice(0, 1)}
      </span>
      <span className="w-12 font-semibold">{name}</span>
      <span className="w-6 text-right font-semibold">{talk}</span>
      <span className="h-1.5 flex-1 rounded-full bg-[#E2E8F0]">
        <span className="block h-full rounded-full bg-[#007AFF]" style={{ width: `${talk}%` }} />
      </span>
    </div>
  );
}

function RelayMotionStyles() {
  return (
    <style>{`
      .relay-motion-stage {
        perspective: 1400px;
      }

      .relay-desktop-shot {
        animation: relayDesktop 18s cubic-bezier(.22,1,.36,1) infinite;
        transform-origin: 50% 50%;
        top: 50%;
      }

      .relay-context-panel {
        animation: relayContextPanel 18s cubic-bezier(.22,1,.36,1) infinite;
      }

      .relay-list-scene {
        animation: relayListScene 18s ease-in-out infinite;
      }

      .relay-detail-scene {
        animation: relayDetailScene 18s ease-in-out infinite;
      }

      .relay-meeting-row {
        animation: relayRows 18s ease-in-out infinite;
        animation-delay: calc(var(--relay-row) * 90ms);
      }

      .relay-mobile-shot {
        left: 50%;
        opacity: 0;
        pointer-events: none;
        top: 50%;
        transform-origin: 50% 50%;
      }

      .relay-mobile-home {
        animation: relayMobileHome 18s cubic-bezier(.22,1,.36,1) infinite;
      }

      .relay-mobile-detail {
        animation: relayMobileDetail 18s cubic-bezier(.22,1,.36,1) infinite;
      }

      .relay-mobile-analytics {
        animation: relayMobileAnalytics 18s cubic-bezier(.22,1,.36,1) infinite;
      }

      @keyframes relayDesktop {
        0% {
          opacity: 0;
          transform: translateY(-48%) scale(.94);
          filter: blur(5px);
        }
        7%, 36% {
          opacity: 1;
          transform: translateY(-50%) scale(1);
          filter: blur(0);
        }
        48% {
          opacity: 1;
          transform: translateY(-50%) scale(.82) rotateX(0deg);
          filter: blur(0);
        }
        57%, 100% {
          opacity: 0;
          transform: translateY(-50%) scale(.7);
          filter: blur(10px);
        }
      }

      @keyframes relayContextPanel {
        0%, 12% {
          opacity: .25;
          transform: translateX(20px);
        }
        24%, 48% {
          opacity: 1;
          transform: translateX(0);
        }
        57%, 100% {
          opacity: .15;
          transform: translateX(20px);
        }
      }

      @keyframes relayListScene {
        0%, 22% {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
        31%, 100% {
          opacity: 0;
          transform: translateY(-18px) scale(.98);
          filter: blur(5px);
          height: 0;
          overflow: hidden;
        }
      }

      @keyframes relayDetailScene {
        0%, 24% {
          opacity: 0;
          transform: translateY(22px) scale(.98);
          filter: blur(7px);
          height: 0;
          overflow: hidden;
        }
        34%, 48% {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
          height: auto;
        }
        57%, 100% {
          opacity: 0;
          transform: translateY(-12px) scale(.98);
          filter: blur(6px);
          height: 0;
          overflow: hidden;
        }
      }

      @keyframes relayRows {
        0%, 9% {
          opacity: 0;
          transform: translateY(12px);
        }
        18%, 28% {
          opacity: 1;
          transform: translateY(0);
        }
        34%, 100% {
          opacity: .28;
          transform: translateY(-8px);
        }
      }

      @keyframes relayMobileHome {
        0%, 51% {
          opacity: 0;
          transform: translate(-50%, -47%) scale(.84);
          filter: blur(8px);
        }
        60%, 70% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
          filter: blur(0);
        }
        76%, 100% {
          opacity: 0;
          transform: translate(-50%, -52%) scale(.92);
          filter: blur(8px);
        }
      }

      @keyframes relayMobileDetail {
        0%, 68% {
          opacity: 0;
          transform: translate(-50%, -47%) scale(.86);
          filter: blur(8px);
        }
        76%, 86% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
          filter: blur(0);
        }
        92%, 100% {
          opacity: 0;
          transform: translate(-50%, -52%) scale(.92);
          filter: blur(8px);
        }
      }

      @keyframes relayMobileAnalytics {
        0%, 84% {
          opacity: 0;
          transform: translate(-50%, -47%) scale(.86);
          filter: blur(8px);
        }
        92%, 97% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
          filter: blur(0);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -52%) scale(.94);
          filter: blur(8px);
        }
      }

      @media (max-width: 860px) {
        .relay-desktop-shot {
          grid-template-columns: 68px minmax(0, 1fr);
          max-width: 760px;
        }

        .relay-desktop-shot > aside:first-child {
          overflow: hidden;
        }

        .relay-desktop-shot > aside:first-child nav span,
        .relay-desktop-shot > aside:first-child > div:not(:first-child) {
          display: none;
        }

        .relay-context-panel {
          display: none;
        }
      }
    `}</style>
  );
}
