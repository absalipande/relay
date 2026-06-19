"use server";

import { apiFetch } from "@/lib/api/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type WorkspaceFormState = {
  message: string | null;
  fieldErrors?: {
    name?: string[];
    slug?: string[];
  };
};

export type DeleteWorkspaceState = {
  message: string | null;
};

export type WorkspaceIdentityUpdateState = {
  message: string | null;
  fieldErrors?: {
    name?: string[];
    slug?: string[];
  };
};

const workspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters.")
    .max(80, "Workspace name must be 80 characters or less."),
  slug: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : undefined))
    .pipe(
      z
        .string()
        .min(2, "Workspace URL must be at least 2 characters.")
        .max(64, "Workspace URL must be 64 characters or less.")
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Use lowercase letters, numbers, and single hyphens.",
        )
        .optional(),
    ),
});

const workspaceIdentitySchema = workspaceSchema.pick({
  name: true,
  slug: true,
});

export async function createWorkspace(
  _previousState: WorkspaceFormState,
  formData: FormData,
): Promise<WorkspaceFormState> {
  const redirectTo = getRedirectPath(formData.get("redirectTo"));
  const parsed = workspaceSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return {
      message: "Check the workspace name and try again.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { error } = await apiFetch<{ workspace: unknown }>("/workspaces", {
    method: "POST",
    body: JSON.stringify({
      name: parsed.data.name,
      slug: parsed.data.slug,
    }),
  });

  if (error) {
    return { message: error };
  }

  revalidatePath("/app");
  revalidatePath("/app/workspaces");
  revalidatePath("/app/workspaces/new");
  redirect(redirectTo);
}

export async function updateWorkspace(
  _previousState: WorkspaceFormState,
  formData: FormData,
): Promise<WorkspaceFormState> {
  const workspaceId = formData.get("workspaceId");
  const parsed = workspaceSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (typeof workspaceId !== "string" || workspaceId.length === 0) {
    return { message: "Choose a workspace to update." };
  }

  if (!parsed.success) {
    return {
      message: "Check the workspace details and try again.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { error } = await apiFetch<{ workspace: unknown }>(
    `/workspaces/${workspaceId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        name: parsed.data.name,
        slug: parsed.data.slug,
      }),
    },
  );

  if (error) {
    return { message: error };
  }

  revalidatePath("/app");
  revalidatePath("/app/workspaces/new");
  redirect(`/app/workspaces/new?workspace=${workspaceId}&panel=details`);
}

export async function updateWorkspaceIdentity(
  workspaceId: string,
  name: string,
  slug: string,
): Promise<WorkspaceIdentityUpdateState> {
  if (workspaceId.length === 0) {
    return { message: "Choose a workspace to update." };
  }

  const parsed = workspaceIdentitySchema.safeParse({ name, slug });

  if (!parsed.success) {
    return {
      message: "Check the workspace name and try again.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { error } = await apiFetch<{ workspace: unknown }>(
    `/workspaces/${workspaceId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        name: parsed.data.name,
        slug: parsed.data.slug,
      }),
    },
  );

  if (error) {
    return { message: error };
  }

  revalidatePath("/app");
  revalidatePath("/app/workspaces/new");
  return { message: null };
}

export async function markWorkspaceOpened(workspaceId: string) {
  if (workspaceId.length === 0) {
    return { message: "Choose a workspace to open." };
  }

  const { error } = await apiFetch<{ workspace: unknown }>(
    `/workspaces/${workspaceId}/opened`,
    {
      method: "POST",
    },
  );

  if (error) {
    return { message: error };
  }

  revalidatePath("/app");
  revalidatePath("/app/workspaces/new");
  return { message: null };
}

export async function deleteWorkspace(
  _previousState: DeleteWorkspaceState,
  formData: FormData,
): Promise<DeleteWorkspaceState> {
  const workspaceId = formData.get("workspaceId");

  if (typeof workspaceId !== "string" || workspaceId.length === 0) {
    return { message: "Choose a workspace to delete." };
  }

  const { error } = await apiFetch(`/workspaces/${workspaceId}`, {
    method: "DELETE",
  });

  if (error) {
    return { message: error };
  }

  revalidatePath("/app");
  revalidatePath("/app/workspaces/new");
  redirect("/app/workspaces/new");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

function getRedirectPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "/app";
  if (!value.startsWith("/app")) return "/app";
  return value;
}
