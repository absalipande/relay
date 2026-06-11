"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskCreateForm } from "@/features/tasks/components/task-create-form";
import type { ApiProject } from "@/lib/api/server";
import { ListPlus, Plus } from "lucide-react";
import { useState } from "react";

type TaskCreateDialogProps = {
  lockedProjectId?: string;
  projects: ApiProject[];
  triggerLabel?: string;
  workspaceId: string;
};

export function TaskCreateDialog({
  lockedProjectId,
  projects,
  triggerLabel = "New task",
  workspaceId,
}: TaskCreateDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 rounded-[0.8rem] bg-[#007AFF] px-4 text-white hover:bg-[#006be0]">
          <Plus className="size-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-none gap-0 overflow-hidden rounded-[1rem] border border-[#E4E4E7] bg-white p-0 text-[#111111] shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)] sm:w-[42rem] sm:max-w-none">
        <DialogHeader className="px-6 pb-1 pt-5 text-left">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[0.75rem] bg-[#EEF6FF] text-[#007AFF]">
              <ListPlus className="size-3.5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-[1.05rem] font-semibold tracking-tight">
                Create task
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[0.84rem] leading-5 text-[#64748B]">
                Add work with priority, due date, and checklist context.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <TaskCreateForm
            lockedProjectId={lockedProjectId}
            projects={projects}
            workspaceId={workspaceId}
            onCreated={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
