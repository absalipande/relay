"use client";

import { Bot, CalendarDays, FolderKanban, Sparkles, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type WorkspaceContextPanelProps = {
  workspace: {
    id: string;
    name: string;
    slug: string;
    created_at: string;
    role: string;
  };
  mode?: "details" | "ai";
  basePath?: string;
  closeHref?: string;
  onClose?: () => void;
  onModeChange?: (mode: "details" | "ai") => void;
};

export function WorkspaceContextPanel({
  workspace,
  mode = "details",
  basePath = "/app",
  closeHref,
  onClose,
  onModeChange,
}: WorkspaceContextPanelProps) {
  const detailsHref = `${basePath}?workspace=${workspace.id}&panel=details`;
  const aiHref = `${basePath}?workspace=${workspace.id}&panel=ai`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">Workspace</p>
          <p className="text-xs text-slate-500">Selected context</p>
        </div>
        {onClose ? (
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
        ) : closeHref ? (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-8 rounded-[0.7rem] text-[#71717A]"
          >
            <a href={closeHref} aria-label="Close workspace panel">
              <X className="size-4" />
            </a>
          </Button>
        ) : (
          <Sparkles className="size-4 text-[#007AFF]" />
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 rounded-xl bg-zinc-50 p-1 text-sm font-medium">
        {onModeChange ? (
          <>
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
          </>
        ) : (
          <>
            <Button
              asChild
              variant="ghost"
              className={`h-8 rounded-lg ${mode === "details" ? "bg-white shadow-sm hover:bg-white" : "hover:bg-zinc-100"}`}
            >
              <a href={detailsHref}>Details</a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className={`h-8 rounded-lg ${mode === "ai" ? "bg-white shadow-sm hover:bg-white" : "hover:bg-zinc-100"}`}
            >
              <a href={aiHref}>AI</a>
            </Button>
          </>
        )}
      </div>

      {mode === "ai" ? (
        <div className="mt-6 rounded-xl bg-zinc-50 p-4">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-[#007AFF]" />
            <p className="text-sm font-semibold">Ask Relay about this</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Soon, Relay will summarize this workspace, find blockers, and draft
            updates from its projects, tasks, comments, and activity.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {workspace.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">/{workspace.slug}</p>
          </div>

          <div className="grid gap-2">
            <ContextRow
              icon={Users}
              label="Your role"
              value={capitalize(workspace.role)}
            />
            <ContextRow icon={FolderKanban} label="Projects" value="Next" />
            <ContextRow
              icon={CalendarDays}
              label="Created"
              value={formatDate(workspace.created_at)}
            />
          </div>

          {basePath !== "/app" ? (
            <Button
              asChild
              className="mt-6 h-10 w-full rounded-[0.8rem] bg-[#007AFF] text-white hover:bg-[#006be0]"
            >
              <a href={`/app?workspace=${workspace.id}`}>Open workspace</a>
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function ContextRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="size-4 text-[#007AFF]" />
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
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
