"use client";

import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import type { ApiTaskPriority, ApiTaskStatus } from "@/lib/api/server";
import { RotateCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type TaskUrlFiltersProps = {
  priorities?: readonly ApiTaskPriority[];
  statuses?: readonly ApiTaskStatus[];
};

const defaultStatuses = ["todo", "in_progress", "done"] as const;
const defaultPriorities = ["low", "medium", "high", "urgent"] as const;

const statusLabels: Record<ApiTaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export function TaskUrlFilters({
  priorities = defaultPriorities,
  statuses = defaultStatuses,
}: TaskUrlFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function resetFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("priority");
    params.delete("dueDate");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <NativeSelect
        aria-label="Filter by status"
        className="h-8 w-36 rounded-[0.55rem] text-xs"
        value={searchParams.get("status") ?? "all"}
        onChange={(event) => setFilter("status", event.target.value)}
      >
        <option value="all">All statuses</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {statusLabels[status]}
          </option>
        ))}
      </NativeSelect>
      <NativeSelect
        aria-label="Filter by priority"
        className="h-8 w-36 rounded-[0.55rem] text-xs"
        value={searchParams.get("priority") ?? "all"}
        onChange={(event) => setFilter("priority", event.target.value)}
      >
        <option value="all">All priorities</option>
        {priorities.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </NativeSelect>
      <input
        aria-label="Filter by due date"
        className="h-8 rounded-[0.55rem] border border-[#E4E4E7] bg-white px-2.5 text-xs shadow-none outline-none focus-visible:border-[#007AFF]/45 focus-visible:ring-2 focus-visible:ring-[#007AFF]/12"
        type="date"
        value={searchParams.get("dueDate") ?? ""}
        onChange={(event) => setFilter("dueDate", event.target.value || "all")}
      />
      <Button
        type="button"
        variant="ghost"
        className="h-8 rounded-[0.55rem] px-2.5 text-xs text-[#64748B] hover:bg-[#F4F4F5]"
        onClick={resetFilters}
      >
        <RotateCcw className="size-3.5" />
        Reset
      </Button>
    </div>
  );
}
