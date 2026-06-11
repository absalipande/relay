"use server";

import { apiFetch } from "@/lib/api/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ProjectFormState = {
  message: string | null;
  fieldErrors?: {
    name?: string[];
    key?: string[];
    description?: string[];
  };
};

export type ProjectActionState = {
  message: string | null;
};

const projectSchema = z.object({
  workspaceId: z.string().uuid("Choose a workspace first."),
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters.")
    .max(100, "Project name must be 100 characters or less."),
  key: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value.toUpperCase() : undefined))
    .pipe(
      z
        .string()
        .min(2, "Project key must be at least 2 characters.")
        .max(12, "Project key must be 12 characters or less.")
        .regex(/^[A-Z][A-Z0-9]*$/, "Use uppercase letters and numbers.")
        .optional(),
    ),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or less.")
    .transform((value) => (value.length > 0 ? value : undefined)),
});

export async function createProject(
  _previousState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const parsed = projectSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    name: formData.get("name"),
    key: formData.get("key"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      message: "Check the project details and try again.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { workspaceId, ...payload } = parsed.data;
  const { error } = await apiFetch<{ project: unknown }>(
    `/workspaces/${workspaceId}/projects`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  if (error) {
    return { message: error };
  }

  revalidatePath("/app");
  return { message: null };
}

export async function archiveProject(
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const workspaceId = formData.get("workspaceId");
  const projectId = formData.get("projectId");

  if (typeof workspaceId !== "string" || typeof projectId !== "string") {
    return { message: "Choose a project to archive." };
  }

  const { error } = await apiFetch(
    `/workspaces/${workspaceId}/projects/${projectId}/archive`,
    {
      method: "POST",
    },
  );

  if (error) {
    return { message: error };
  }

  revalidatePath("/app");
  return { message: null };
}
