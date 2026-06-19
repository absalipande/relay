import { createClient } from "@/lib/supabase/server";

const defaultApiOrigin = "http://localhost:4000";

export type ApiWorkspace = {
  id: string;
  icon_color: string | null;
  icon_initials: string | null;
  name: string;
  slug: string;
  created_at: string;
  last_opened_at: string | null;
  updated_at: string;
  role: string;
};

export type ApiProject = {
  id: string;
  workspace_id: string;
  name: string;
  key: string;
  description: string | null;
  status: "active" | "paused" | "archived";
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiTaskStatus = "todo" | "in_progress" | "done";
export type ApiTaskPriority = "low" | "medium" | "high" | "urgent";

export type ApiTaskChecklistItem = {
  id: string;
  task_id: string;
  workspace_id: string;
  title: string;
  is_done: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type ApiTask = {
  id: string;
  workspace_id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: ApiTaskStatus;
  priority: ApiTaskPriority;
  assignee_id: string | null;
  due_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  checklist_items: ApiTaskChecklistItem[];
};

type ApiResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return {
      data: null,
      error: "You need to sign in again.",
    };
  }

  const response = await fetch(`${getApiOrigin()}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${session.access_token}`,
      ...init.headers,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return {
      data: null,
      error:
        "Relay API is offline. Start the API server with `npm run dev` in apps/api.",
    };
  }

  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | T
    | null;

  if (!response.ok) {
    return {
      data: null,
      error: getApiError(payload),
    };
  }

  return {
    data: payload as T,
    error: null,
  };
}

function getApiOrigin() {
  return process.env.API_ORIGIN ?? defaultApiOrigin;
}

function getApiError(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return "The API request failed.";
}
