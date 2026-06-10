"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWorkspace,
  type WorkspaceFormState,
} from "@/features/workspaces/actions";

const initialState: WorkspaceFormState = {
  message: null,
};

type WorkspaceCreateFormProps = {
  compact?: boolean;
  redirectTo?: string;
};

export function WorkspaceCreateForm({
  compact = false,
  redirectTo = "/app",
}: WorkspaceCreateFormProps) {
  const [state, formAction] = useActionState(createWorkspace, initialState);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const nameError = state.fieldErrors?.name?.[0];
  const slugError = state.fieldErrors?.slug?.[0];
  const generatedSlug = useMemo(() => slugifyWorkspaceName(name), [name]);
  const displayedSlug = slugEdited ? slug : generatedSlug;

  return (
    <aside
      className={
        compact
          ? "h-fit rounded-[1rem] border border-[#E4E4E7] bg-white p-4 shadow-[0_18px_54px_-42px_rgba(15,23,42,0.5)]"
          : "h-fit rounded-[1rem] bg-white"
      }
    >
      {!compact ? (
        <div>
          <h2 className="text-lg font-semibold">Create workspace</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Start with a team space. Projects, tasks, and members will hang from
            here next.
          </p>
        </div>
      ) : null}

      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Label htmlFor="workspace-name" className="block space-y-2">
          <span className="text-sm font-semibold text-[#18181B]">
            Workspace name
          </span>
          <Input
            id="workspace-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Acme Product"
            aria-invalid={Boolean(nameError)}
            className="h-10 rounded-[0.8rem] border border-[#E4E4E7] bg-white focus-visible:border-[#007AFF]/45 focus-visible:ring-2 focus-visible:ring-[#007AFF]/12"
          />
        </Label>

        {nameError ? (
          <p className="text-sm font-medium text-red-600">{nameError}</p>
        ) : null}

        <Label htmlFor="workspace-slug" className="block space-y-2">
          <span className="text-sm font-semibold text-[#18181B]">
            Workspace URL
          </span>
          <div className="flex min-w-0 items-center rounded-[0.8rem] border border-[#E4E4E7] bg-white focus-within:border-[#007AFF]/45 focus-within:ring-2 focus-within:ring-[#007AFF]/12">
            <span className="shrink-0 pl-3 text-sm text-[#71717A]">
              relay.app/
            </span>
            <Input
              id="workspace-slug"
              name="slug"
              value={displayedSlug}
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(slugifyWorkspaceName(event.target.value));
              }}
              placeholder={generatedSlug || "acme-product"}
              aria-invalid={Boolean(slugError)}
              className="h-10 border-0 bg-transparent pl-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
            />
          </div>
        </Label>

        {slugError ? (
          <p className="text-sm font-medium text-red-600">{slugError}</p>
        ) : null}

        {state.message ? (
          <p className="rounded-[0.8rem] bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.message}
          </p>
        ) : null}

        <SubmitButton />
      </form>
    </aside>
  );
}

function slugifyWorkspaceName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-10 w-full rounded-[0.8rem] bg-[#007AFF] text-white hover:bg-[#006be0]"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Creating
        </>
      ) : (
        "Create workspace"
      )}
    </Button>
  );
}
