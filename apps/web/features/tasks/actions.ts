"use server";

import { apiFetch } from "@/lib/api/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type TaskFormState = {
  message: string | null;
  fieldErrors?: {
    projectId?: string[];
    title?: string[];
    description?: string[];
    priority?: string[];
    dueDate?: string[];
    checklistItems?: string[];
  };
};

export type TaskActionState = {
  message: string | null;
};

const taskSchema = z.object({
  workspaceId: z.string().uuid("Choose a workspace first."),
  projectId: z.string().uuid("Choose a project first."),
  title: z
    .string()
    .trim()
    .min(2, "Task title must be at least 2 characters.")
    .max(160, "Task title must be 160 characters or less."),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or less.")
    .transform((value) => (value.length > 0 ? value : undefined)),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  dueDate: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : undefined))
    .pipe(z.string().date("Use a valid due date.").optional()),
  checklistItems: z
    .string()
    .trim()
    .transform((value) =>
      value.length > 0
        ? value
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    )
    .pipe(
      z
        .array(z.string().min(1).max(160))
        .max(20, "Use 20 checklist items or fewer."),
    ),
});

export async function createTask(
  _previousState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const parsed = taskSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority") || "medium",
    dueDate: formData.get("dueDate"),
    checklistItems: formData.get("checklistItems"),
  });

  if (!parsed.success) {
    return {
      message: "Check the task details and try again.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { workspaceId, ...payload } = parsed.data;
  const { error } = await apiFetch<{ task: unknown }>(
    `/workspaces/${workspaceId}/tasks`,
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

export async function updateTaskStatus(
  _previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const workspaceId = formData.get("workspaceId");
  const taskId = formData.get("taskId");
  const status = formData.get("status");

  if (
    typeof workspaceId !== "string" ||
    typeof taskId !== "string" ||
    !isTaskStatus(status)
  ) {
    return { message: "Choose a task status to update." };
  }

  const { error } = await apiFetch(`/workspaces/${workspaceId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  if (error) {
    return { message: error };
  }

  revalidatePath("/app");
  return { message: null };
}

export async function toggleChecklistItem(
  _previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const workspaceId = formData.get("workspaceId");
  const itemId = formData.get("itemId");
  const isDone = formData.get("isDone") === "true";

  if (typeof workspaceId !== "string" || typeof itemId !== "string") {
    return { message: "Choose a checklist item to update." };
  }

  const { error } = await apiFetch(
    `/workspaces/${workspaceId}/checklist-items/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ isDone }),
    },
  );

  if (error) {
    return { message: error };
  }

  revalidatePath("/app");
  return { message: null };
}

function isTaskStatus(value: FormDataEntryValue | null) {
  return value === "todo" || value === "in_progress" || value === "done";
}
