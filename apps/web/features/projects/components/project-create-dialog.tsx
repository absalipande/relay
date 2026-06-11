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
import { ProjectCreateForm } from "@/features/projects/components/project-create-form";
import { Folder, Plus } from "lucide-react";
import { useEffect, useState } from "react";

type ProjectCreateDialogProps = {
  triggerVariant?: "button" | "icon";
  workspaceName: string;
  workspaceId: string;
};

export function ProjectCreateDialog({
  triggerVariant = "button",
  workspaceName,
  workspaceId,
}: ProjectCreateDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#new-project") {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerVariant === "icon" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 rounded-[0.55rem] text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#007AFF]"
            aria-label="Create project"
          >
            <Plus className="size-4" />
          </Button>
        ) : (
          <Button className="h-9 rounded-[0.8rem] bg-[#007AFF] px-4 text-white hover:bg-[#006be0]">
            <Plus className="size-4" />
            New project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-none gap-0 overflow-hidden rounded-[1rem] border border-[#E4E4E7] bg-white p-0 text-[#111111] shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)] sm:w-[38rem] sm:max-w-none">
        <DialogHeader className="px-6 pb-1 pt-5 text-left">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[0.75rem] bg-[#EEF6FF] text-[#007AFF]">
              <Folder className="size-3.5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-[1.05rem] font-semibold tracking-tight">
                Create project
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[0.84rem] leading-5 text-[#64748B]">
                Add a focused space inside {workspaceName}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ProjectCreateForm
          showCancel
          workspaceId={workspaceId}
          onCreated={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
