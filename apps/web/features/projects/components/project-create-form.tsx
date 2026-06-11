"use client";

import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/features/projects/actions";
import { Lightbulb, Loader2 } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

type ProjectCreateFormProps = {
  onCreated?: () => void;
  showCancel?: boolean;
  workspaceId: string;
};

const initialState = {
  message: null,
};

export function ProjectCreateForm({
  onCreated,
  showCancel = false,
  workspaceId,
}: ProjectCreateFormProps) {
  const [state, formAction, pending] = useActionState(
    createProject,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmittedRef = useRef(false);

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
      onSubmit={() => {
        hasSubmittedRef.current = true;
      }}
    >
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <div className="space-y-3.5 px-6 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="project-name" className="text-[0.8rem] font-semibold">
            Project name
          </Label>
          <Input
            id="project-name"
            name="name"
            placeholder="Your project"
            className="h-9 rounded-[0.7rem] border-[#E4E4E7] bg-white text-[0.84rem] shadow-none focus-visible:border-[#007AFF]/45 focus-visible:ring-2 focus-visible:ring-[#007AFF]/12"
            aria-invalid={Boolean(state.fieldErrors?.name)}
          />
          <FieldError errors={state.fieldErrors?.name} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="project-key" className="text-[0.8rem] font-semibold">
            Project key
          </Label>
          <Input
            id="project-key"
            name="key"
            placeholder="PORT"
            className="h-9 rounded-[0.7rem] border-[#E4E4E7] bg-white text-[0.84rem] uppercase shadow-none focus-visible:border-[#007AFF]/45 focus-visible:ring-2 focus-visible:ring-[#007AFF]/12"
            aria-invalid={Boolean(state.fieldErrors?.key)}
          />
          <p className="text-[0.74rem] leading-4 text-[#64748B]">
            Used later for readable task IDs, like{" "}
            <span className="font-semibold text-[#334155]">PORT-12</span>.
            Leave it blank and Relay will suggest one.
          </p>
          <FieldError errors={state.fieldErrors?.key} />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="project-description"
            className="text-[0.8rem] font-semibold"
          >
            Description{" "}
            <span className="font-normal text-[#64748B]">(optional)</span>
          </Label>
          <Textarea
            id="project-description"
            name="description"
            placeholder="What this project is meant to move forward."
            className="min-h-20 resize-none rounded-[0.7rem] border-[#E4E4E7] bg-white text-[0.84rem] shadow-none focus-visible:border-[#007AFF]/45 focus-visible:ring-2 focus-visible:ring-[#007AFF]/12"
            aria-invalid={Boolean(state.fieldErrors?.description)}
          />
          <FieldError errors={state.fieldErrors?.description} />
        </div>

        <div className="flex items-center gap-2.5 rounded-[0.7rem] bg-[#F8FAFC] px-3 py-2.5">
          <span className="grid size-7 shrink-0 place-items-center rounded-[0.6rem] bg-[#EEF6FF] text-[#007AFF]">
            <Lightbulb className="size-3.5" />
          </span>
          <p className="text-[0.8rem] leading-5 text-[#64748B]">
            <span className="font-semibold text-[#334155]">Tip:</span> Keep
            the name short and recognizable.
          </p>
        </div>

        {state.message ? (
          <p className="text-sm font-medium text-[#DC2626]">{state.message}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-[#E4E4E7] bg-[#FBFBFC] px-6 py-3.5">
        {showCancel ? (
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-[0.7rem] border-[#E4E4E7] bg-white px-4 text-[0.8rem] text-[#334155] hover:bg-[#F8FAFC]"
            >
              Cancel
            </Button>
          </DialogClose>
        ) : null}
        <Button
          type="submit"
          disabled={pending}
          className="h-8 rounded-[0.7rem] bg-[#007AFF] px-4 text-[0.8rem] text-white hover:bg-[#006be0]"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Create project
        </Button>
      </div>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs font-medium text-[#DC2626]">{errors[0]}</p>;
}
