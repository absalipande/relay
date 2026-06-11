"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { createTask } from "@/features/tasks/actions";
import type { ApiProject } from "@/lib/api/server";
import { Loader2, Plus } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

type TaskCreateFormProps = {
  lockedProjectId?: string;
  onCreated?: () => void;
  projects: ApiProject[];
  workspaceId: string;
};

const initialState = {
  message: null,
};

export function TaskCreateForm({
  lockedProjectId,
  onCreated,
  projects,
  workspaceId,
}: TaskCreateFormProps) {
  const [state, formAction, pending] = useActionState(createTask, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmittedRef = useRef(false);
  const activeProjects = projects.filter(
    (project) => project.status !== "archived",
  );
  const selectedProject = lockedProjectId
    ? activeProjects.find((project) => project.id === lockedProjectId)
    : undefined;

  useEffect(() => {
    if (!pending && state.message === null && hasSubmittedRef.current) {
      formRef.current?.reset();
      hasSubmittedRef.current = false;
      onCreated?.();
    }
  }, [onCreated, pending, state.message]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4"
      onSubmit={() => {
        hasSubmittedRef.current = true;
      }}
    >
      <input type="hidden" name="workspaceId" value={workspaceId} />

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
        <div className="space-y-2">
          <Label htmlFor="task-title">Task title</Label>
          <Input
            id="task-title"
            name="title"
            placeholder="QA sign-in flow"
            className="h-10 rounded-[0.8rem]"
            aria-invalid={Boolean(state.fieldErrors?.title)}
          />
          <FieldError errors={state.fieldErrors?.title} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-priority">Priority</Label>
          <NativeSelect
            id="task-priority"
            name="priority"
            defaultValue="medium"
            className="w-full"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </NativeSelect>
          <FieldError errors={state.fieldErrors?.priority} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
        {lockedProjectId ? (
          <div className="space-y-2">
            <Label>Project</Label>
            <input type="hidden" name="projectId" value={lockedProjectId} />
            <div className="flex h-10 items-center rounded-[0.8rem] border border-[#E4E4E7] bg-[#F8FAFC] px-3 text-sm font-medium text-[#334155]">
              {selectedProject
                ? `${selectedProject.key} - ${selectedProject.name}`
                : "Project selected"}
            </div>
            <FieldError errors={state.fieldErrors?.projectId} />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="task-project">Project</Label>
            <NativeSelect
              id="task-project"
              name="projectId"
              className="w-full"
              disabled={activeProjects.length === 0}
              aria-invalid={Boolean(state.fieldErrors?.projectId)}
            >
              {activeProjects.length === 0 ? (
                <option value="">Create a project first</option>
              ) : (
                activeProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.key} - {project.name}
                  </option>
                ))
              )}
            </NativeSelect>
            <FieldError errors={state.fieldErrors?.projectId} />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="task-due-date">Due date</Label>
          <Input
            id="task-due-date"
            name="dueDate"
            type="date"
            className="h-10 rounded-[0.8rem]"
            aria-invalid={Boolean(state.fieldErrors?.dueDate)}
          />
          <FieldError errors={state.fieldErrors?.dueDate} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-description">Description</Label>
        <Textarea
          id="task-description"
          name="description"
          placeholder="Context, acceptance criteria, or notes"
          className="min-h-20 resize-none rounded-[0.8rem]"
          aria-invalid={Boolean(state.fieldErrors?.description)}
        />
        <FieldError errors={state.fieldErrors?.description} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-checklist">Checklist</Label>
        <Textarea
          id="task-checklist"
          name="checklistItems"
          placeholder={"One item per line\nConfirm empty state\nTest mobile layout"}
          className="min-h-24 resize-none rounded-[0.8rem]"
          aria-invalid={Boolean(state.fieldErrors?.checklistItems)}
        />
        <FieldError errors={state.fieldErrors?.checklistItems} />
      </div>

      {state.message ? (
        <p className="text-sm font-medium text-[#DC2626]">{state.message}</p>
      ) : null}

      <Button
        type="submit"
        disabled={pending || activeProjects.length === 0}
        className="h-10 rounded-[0.8rem] bg-[#007AFF] px-4 text-white hover:bg-[#006be0]"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        Create task
      </Button>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs font-medium text-[#DC2626]">{errors[0]}</p>;
}
