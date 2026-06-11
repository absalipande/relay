import {
  CheckCircle2,
  Clock3,
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export type AccountUser = {
  email: string;
  fullName: string;
  initials: string;
  joinedLabel: string;
  roleLabel: string;
  workspaceAccessLabel: string;
};

export function ProfilePageContent({ user }: { user: AccountUser }) {
  return (
    <div className="space-y-6 py-4">
      <PageHeader
        eyebrow="Profile"
        title="Personal profile"
        description="Manage how your name and account details appear across Relay."
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="bg-white">
          <div className="flex flex-wrap items-center gap-4 border-b border-[#E4E4E7] pb-5">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-[#030712] text-lg font-semibold text-white">
              {user.initials}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold tracking-tight">
                {user.fullName}
              </h2>
              <p className="mt-1 truncate text-sm text-[#64748B]">
                {user.email}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Display name" value={user.fullName} />
            <Field label="Email address" value={user.email} type="email" />
            <Field label="Role" value={user.roleLabel} />
            <Field label="Timezone" value="Asia/Manila" />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" className="h-9 rounded-[0.5rem]">
              Cancel
            </Button>
            <Button className="h-9 rounded-[0.5rem] bg-[#007AFF] text-white hover:bg-[#0067d6]">
              Save profile
            </Button>
          </div>
        </section>

        <aside className="divide-y divide-[#E4E4E7]">
          <InfoPanel
            icon={UserRound}
            title="Account identity"
            rows={[
              ["Status", "Active"],
              ["Joined", user.joinedLabel],
              ["Profile visibility", "Team only"],
            ]}
          />
          <InfoPanel
            className="pt-5"
            icon={CheckCircle2}
            title="Setup"
            rows={[
              ["Email", "Connected"],
              ["Workspace access", user.workspaceAccessLabel],
              ["Notifications", "Default"],
            ]}
          />
        </aside>
      </div>
    </div>
  );
}

export function AccountSettingsContent({ user }: { user: AccountUser }) {
  return (
    <div className="space-y-6 py-4">
      <PageHeader
        eyebrow="Settings"
        title="Account settings"
        description="Review sign-in, security, and notification preferences for your Relay account."
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="divide-y divide-[#E4E4E7]">
          <SettingsSection
            icon={Mail}
            title="Email preferences"
            description="Choose which account updates land in your inbox."
          >
            <ToggleRow
              title="Workspace activity"
              description="Task assignments, mentions, and project updates."
              defaultChecked
            />
            <ToggleRow
              title="Weekly summary"
              description="A compact recap of open work and upcoming deadlines."
              defaultChecked
            />
            <ToggleRow
              title="Product updates"
              description="New Relay features and workflow improvements."
            />
          </SettingsSection>

          <SettingsSection
            className="pt-6"
            icon={ShieldCheck}
            title="Security"
            description="Keep account access predictable and visible."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Login email" value={user.email} type="email" />
              <Field label="Password" value="Managed by your sign-in provider" />
            </div>
            <div className="mt-5 flex justify-end">
              <Button variant="outline" className="h-9 rounded-[0.5rem]">
                Manage security
              </Button>
            </div>
          </SettingsSection>
        </section>

        <aside className="divide-y divide-[#E4E4E7]">
          <InfoPanel
            icon={KeyRound}
            title="Access"
            rows={[
              ["Account", user.email],
              ["Authentication", "Supabase"],
              ["Session", "Signed in"],
            ]}
          />
          <InfoPanel
            className="pt-5"
            icon={Clock3}
            title="Preferences"
            rows={[
              ["Timezone", "Asia/Manila"],
              ["Language", "English"],
              ["Date format", "Jun 11, 2026"],
            ]}
          />
        </aside>
      </div>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-[32px] font-semibold leading-tight tracking-tight">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  type = "text",
}: {
  label: string;
  value: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#71717A]">
        {label}
      </span>
      <Input
        type={type}
        defaultValue={value}
        className="mt-2 h-10 rounded-[0.5rem] border-[#E4E4E7] bg-white text-sm shadow-none focus-visible:border-[#007AFF]/45 focus-visible:ring-2 focus-visible:ring-[#007AFF]/12"
      />
    </label>
  );
}

function SettingsSection({
  className = "",
  icon: Icon,
  title,
  description,
  children,
}: {
  className?: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-white pb-6 ${className}`}>
      <div className="mb-5 flex items-start gap-3 border-b border-[#E4E4E7] pb-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-[0.5rem] bg-[#EFF6FF] text-[#007AFF]">
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-[#64748B]">
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  title,
  description,
  defaultChecked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#F1F5F9] py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div>
        <p className="text-sm font-semibold text-[#18181B]">{title}</p>
        <p className="mt-1 text-sm leading-5 text-[#64748B]">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function InfoPanel({
  className = "",
  icon: Icon,
  title,
  rows,
}: {
  className?: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  rows: [string, string][];
}) {
  return (
    <div className={`bg-white pb-5 ${className}`}>
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-[#007AFF]" />
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      </div>
      <dl className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <dt className="text-xs font-medium text-[#71717A]">{label}</dt>
            <dd className="max-w-[12rem] truncate text-right text-xs font-semibold text-[#18181B]">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
