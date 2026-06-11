import { describe, expect, it } from "vitest";
import { buildApp } from "./app.js";
import type { SupabaseClient } from "@supabase/supabase-js";

const testConfig = {
  NODE_ENV: "test" as const,
  HOST: "127.0.0.1",
  PORT: 4000,
  WEB_ORIGIN: "http://localhost:3000",
  SUPABASE_URL: undefined,
  SUPABASE_PUBLISHABLE_KEY: undefined,
  SUPABASE_SERVICE_ROLE_KEY: undefined,
};

describe("api app", () => {
  it("responds to health checks", async () => {
    const app = await buildApp(testConfig);

    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      ok: true,
      service: "relay-api",
    });
  });

  it("keeps the Supabase client optional for local scaffolding", async () => {
    const app = await buildApp(testConfig);

    expect(app.supabase).toBeNull();
  });

  it("requires auth for workspace routes", async () => {
    const app = await buildApp(testConfig);

    const response = await app.inject({
      method: "GET",
      url: "/workspaces",
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: "Supabase is not configured.",
    });
  });

  it("rejects missing bearer tokens when Supabase is configured", async () => {
    const supabase = createFakeSupabase();
    const app = await buildApp(testConfig, {
      supabase,
      createSupabaseForUser: () => supabase,
    });

    const response = await app.inject({
      method: "GET",
      url: "/workspaces",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: "Missing bearer token.",
    });
  });

  it("creates and lists workspaces for authenticated users", async () => {
    const supabase = createFakeSupabase();
    const app = await buildApp(testConfig, {
      supabase,
      createSupabaseForUser: () => supabase,
    });

    const createResponse = await app.inject({
      method: "POST",
      url: "/workspaces",
      headers: {
        authorization: "Bearer valid-token",
      },
      payload: {
        name: "Product Team",
      },
    });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.json().workspace).toMatchObject({
      name: "Product Team",
      role: "owner",
    });

    const listResponse = await app.inject({
      method: "GET",
      url: "/workspaces",
      headers: {
        authorization: "Bearer valid-token",
      },
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().workspaces).toHaveLength(1);
    expect(listResponse.json().workspaces[0]).toMatchObject({
      name: "Product Team",
      role: "owner",
    });
  });

  it("creates and lists projects inside a workspace", async () => {
    const supabase = createFakeSupabase();
    const app = await buildApp(testConfig, {
      supabase,
      createSupabaseForUser: () => supabase,
    });

    const createWorkspaceResponse = await app.inject({
      method: "POST",
      url: "/workspaces",
      headers: {
        authorization: "Bearer valid-token",
      },
      payload: {
        name: "Product Team",
      },
    });
    const workspaceId = createWorkspaceResponse.json().workspace.id;

    const createProjectResponse = await app.inject({
      method: "POST",
      url: `/workspaces/${workspaceId}/projects`,
      headers: {
        authorization: "Bearer valid-token",
      },
      payload: {
        name: "Mobile Launch",
        key: "MOB",
        description: "Ship the first public mobile release.",
      },
    });

    expect(createProjectResponse.statusCode).toBe(201);
    expect(createProjectResponse.json().project).toMatchObject({
      workspace_id: workspaceId,
      name: "Mobile Launch",
      key: "MOB",
      status: "active",
    });

    const listProjectResponse = await app.inject({
      method: "GET",
      url: `/workspaces/${workspaceId}/projects`,
      headers: {
        authorization: "Bearer valid-token",
      },
    });

    expect(listProjectResponse.statusCode).toBe(200);
    expect(listProjectResponse.json().projects).toHaveLength(1);
    expect(listProjectResponse.json().projects[0]).toMatchObject({
      name: "Mobile Launch",
      key: "MOB",
    });
  });

  it("creates and lists tasks with checklist items", async () => {
    const supabase = createFakeSupabase();
    const app = await buildApp(testConfig, {
      supabase,
      createSupabaseForUser: () => supabase,
    });

    const createWorkspaceResponse = await app.inject({
      method: "POST",
      url: "/workspaces",
      headers: {
        authorization: "Bearer valid-token",
      },
      payload: {
        name: "Product Team",
      },
    });
    const workspaceId = createWorkspaceResponse.json().workspace.id;

    const createProjectResponse = await app.inject({
      method: "POST",
      url: `/workspaces/${workspaceId}/projects`,
      headers: {
        authorization: "Bearer valid-token",
      },
      payload: {
        name: "Mobile Launch",
        key: "MOB",
      },
    });
    const projectId = createProjectResponse.json().project.id;

    const createTaskResponse = await app.inject({
      method: "POST",
      url: `/workspaces/${workspaceId}/tasks`,
      headers: {
        authorization: "Bearer valid-token",
      },
      payload: {
        projectId,
        title: "QA sign-in flow",
        description: "Cover happy path and reset-password handoff.",
        priority: "high",
        dueDate: "2026-06-30",
        checklistItems: ["Email/password", "Invalid password", "Reset link"],
      },
    });

    expect(createTaskResponse.statusCode).toBe(201);
    expect(createTaskResponse.json().task).toMatchObject({
      workspace_id: workspaceId,
      project_id: projectId,
      title: "QA sign-in flow",
      priority: "high",
      status: "todo",
    });
    expect(createTaskResponse.json().task.checklist_items).toHaveLength(3);

    const listTaskResponse = await app.inject({
      method: "GET",
      url: `/workspaces/${workspaceId}/tasks?projectId=${projectId}`,
      headers: {
        authorization: "Bearer valid-token",
      },
    });

    expect(listTaskResponse.statusCode).toBe(200);
    expect(listTaskResponse.json().tasks).toHaveLength(1);
    expect(listTaskResponse.json().tasks[0].checklist_items).toHaveLength(3);
    expect(listTaskResponse.json().tasks[0].checklist_items[0]).toMatchObject({
      title: "Email/password",
      is_done: false,
    });
  });
});

function createFakeSupabase() {
  const workspaces: Array<{
    id: string;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
  }> = [];
  const workspaceMembers: Array<{
    workspace_id: string;
    user_id: string;
    role: string;
    created_at: string;
  }> = [];
  const projects: Array<{
    id: string;
    workspace_id: string;
    name: string;
    key: string;
    description: string | null;
    status: string;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  }> = [];
  const tasks: Array<{
    id: string;
    workspace_id: string;
    project_id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    assignee_id: string | null;
    due_date: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  }> = [];
  const taskChecklistItems: Array<{
    id: string;
    task_id: string;
    workspace_id: string;
    title: string;
    is_done: boolean;
    position: number;
    created_at: string;
    updated_at: string;
  }> = [];
  const user = {
    id: "user-1",
    email: "person@example.com",
  };

  return {
    auth: {
      async getUser(token: string) {
        if (token !== "valid-token") {
          return {
            data: { user: null },
            error: { message: "Invalid token" },
          };
        }

        return {
          data: { user },
          error: null,
        };
      },
    },
    from(table: string) {
      return createTableQuery(table, {
        projects,
        taskChecklistItems,
        tasks,
        workspaces,
        workspaceMembers,
      });
    },
    async rpc(functionName: string, params: Record<string, string>) {
      if (functionName !== "create_workspace_for_current_user") {
        return {
          data: null,
          error: { message: "Unknown RPC" },
        };
      }

      const workspace = {
        id: params.workspace_id,
        name: params.workspace_name,
        slug: params.workspace_slug,
        created_at: "2026-06-10T00:00:00.000Z",
        updated_at: "2026-06-10T00:00:00.000Z",
      };

      workspaces.push(workspace);
      workspaceMembers.push({
        workspace_id: params.workspace_id,
        user_id: user.id,
        role: "owner",
        created_at: "2026-06-10T00:00:00.000Z",
      });

      return {
        data: [workspace],
        error: null,
      };
    },
  } as unknown as SupabaseClient;
}

function createTableQuery(
  table: string,
  store: {
    projects: Array<{
      id: string;
      workspace_id: string;
      name: string;
      key: string;
      description: string | null;
      status: string;
      created_by: string | null;
      created_at: string;
      updated_at: string;
    }>;
    taskChecklistItems: Array<{
      id: string;
      task_id: string;
      workspace_id: string;
      title: string;
      is_done: boolean;
      position: number;
      created_at: string;
      updated_at: string;
    }>;
    tasks: Array<{
      id: string;
      workspace_id: string;
      project_id: string;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      assignee_id: string | null;
      due_date: string | null;
      created_by: string | null;
      created_at: string;
      updated_at: string;
    }>;
    workspaces: Array<{
      id: string;
      name: string;
      slug: string;
      created_at: string;
      updated_at: string;
    }>;
    workspaceMembers: Array<{
      workspace_id: string;
      user_id: string;
      role: string;
      created_at: string;
    }>;
  },
) {
  const filters = new Map<string, string>();
  let insertValue: unknown = null;
  let updateValue: unknown = null;
  let selectedColumns = "";
  let deleteMode = false;
  let countMode = false;
  let headMode = false;
  const inFilters = new Map<string, string[]>();

  const query = {
    select(columns: string, options?: { count?: string; head?: boolean }) {
      selectedColumns = columns;
      countMode = Boolean(options?.count);
      headMode = Boolean(options?.head);
      return query;
    },
    insert(value: unknown) {
      insertValue = value;
      if (table === "workspaces") {
        const workspace = {
          ...(value as {
            id: string;
            name: string;
            slug: string;
          }),
          created_at: "2026-06-10T00:00:00.000Z",
          updated_at: "2026-06-10T00:00:00.000Z",
        };
        store.workspaces.push(workspace);
      }

      if (table === "workspace_members") {
        store.workspaceMembers.push({
          ...(value as {
            workspace_id: string;
            user_id: string;
            role: string;
          }),
          created_at: "2026-06-10T00:00:00.000Z",
        });
      }

      if (table === "projects") {
        const project = {
          ...(value as {
            id: string;
            workspace_id: string;
            name: string;
            key: string;
            description: string | null;
            created_by: string;
          }),
          status: "active",
          created_at: "2026-06-10T00:00:00.000Z",
          updated_at: "2026-06-10T00:00:00.000Z",
        };
        store.projects.push(project);
      }

      if (table === "tasks") {
        const task = {
          ...(value as {
            id: string;
            workspace_id: string;
            project_id: string;
            title: string;
            description: string | null;
            status: string;
            priority: string;
            assignee_id: string | null;
            due_date: string | null;
            created_by: string | null;
          }),
          created_at: "2026-06-10T00:00:00.000Z",
          updated_at: "2026-06-10T00:00:00.000Z",
        };
        store.tasks.push(task);
      }

      if (table === "task_checklist_items") {
        const values = Array.isArray(value) ? value : [value];
        for (const item of values) {
          store.taskChecklistItems.push({
            ...(item as {
              id: string;
              task_id: string;
              workspace_id: string;
              title: string;
              position: number;
            }),
            is_done: false,
            created_at: "2026-06-10T00:00:00.000Z",
            updated_at: "2026-06-10T00:00:00.000Z",
          });
        }
      }

      return query;
    },
    update(value: unknown) {
      updateValue = value;
      return query;
    },
    delete() {
      deleteMode = true;
      return query;
    },
    eq(column: string, value: string) {
      filters.set(column, value);

      if (deleteMode && table === "workspaces" && column === "id") {
        const index = store.workspaces.findIndex(
          (workspace) => workspace.id === value,
        );
        if (index >= 0) store.workspaces.splice(index, 1);
      }

      if (updateValue && table === "workspaces" && column === "id") {
        const workspace = store.workspaces.find((item) => item.id === value);
        if (workspace) {
          Object.assign(workspace, updateValue);
        }
      }

      if (updateValue && table === "projects" && column === "id") {
        const project = store.projects.find((item) => item.id === value);
        if (project) {
          Object.assign(project, updateValue);
        }
      }

      if (updateValue && table === "tasks" && column === "id") {
        const task = store.tasks.find((item) => item.id === value);
        if (task) {
          Object.assign(task, updateValue);
        }
      }

      if (updateValue && table === "task_checklist_items" && column === "id") {
        const checklistItem = store.taskChecklistItems.find(
          (item) => item.id === value,
        );
        if (checklistItem) {
          Object.assign(checklistItem, updateValue);
        }
      }

      return query;
    },
    in(column: string, values: string[]) {
      inFilters.set(column, values);
      return query;
    },
    order() {
      return query;
    },
    async single() {
      if (table === "workspaces" && insertValue) {
        return {
          data: store.workspaces.at(-1),
          error: null,
        };
      }

      if (table === "projects" && insertValue) {
        return {
          data: store.projects.at(-1),
          error: null,
        };
      }

      if (table === "tasks" && insertValue) {
        return {
          data: store.tasks.at(-1),
          error: null,
        };
      }

      if (table === "task_checklist_items" && insertValue) {
        return {
          data: store.taskChecklistItems.at(-1),
          error: null,
        };
      }

      if (table === "workspaces") {
        return {
          data:
            store.workspaces.find(
              (workspace) => workspace.id === filters.get("id"),
            ) ?? null,
          error: null,
        };
      }

      return { data: null, error: null };
    },
    async maybeSingle() {
      if (table === "workspace_members") {
        return {
          data:
            store.workspaceMembers.find(
              (member) =>
                member.workspace_id === filters.get("workspace_id") &&
                member.user_id === filters.get("user_id"),
            ) ?? null,
          error: null,
        };
      }

      if (table === "projects") {
        return {
          data:
            store.projects.find(
              (project) =>
                project.workspace_id === filters.get("workspace_id") &&
                project.id === filters.get("id"),
            ) ?? null,
          error: null,
        };
      }

      if (table === "tasks") {
        return {
          data:
            store.tasks.find(
              (task) =>
                task.workspace_id === filters.get("workspace_id") &&
                task.id === filters.get("id"),
            ) ?? null,
          error: null,
        };
      }

      return { data: null, error: null };
    },
    then(resolve: (value: unknown) => void) {
      if (table === "workspace_members" && selectedColumns.includes("workspaces")) {
        resolve({
          data: store.workspaceMembers
            .filter((member) => member.user_id === filters.get("user_id"))
            .map((member) => ({
              role: member.role,
              workspaces:
                store.workspaces.find(
                  (workspace) => workspace.id === member.workspace_id,
                ) ?? null,
            })),
          error: null,
        });
        return;
      }

      if (table === "projects") {
        resolve({
          data: store.projects.filter(
            (project) => project.workspace_id === filters.get("workspace_id"),
          ),
          error: null,
        });
        return;
      }

      if (table === "tasks") {
        resolve({
          data: store.tasks.filter(
            (task) =>
              task.workspace_id === filters.get("workspace_id") &&
              (!filters.has("project_id") ||
                task.project_id === filters.get("project_id")),
          ),
          error: null,
        });
        return;
      }

      if (table === "task_checklist_items") {
        const filteredItems = store.taskChecklistItems.filter((item) => {
          const taskIdFilter = filters.get("task_id");
          const workspaceIdFilter = filters.get("workspace_id");
          const taskIds = inFilters.get("task_id");

          return (
            (!taskIdFilter || item.task_id === taskIdFilter) &&
            (!workspaceIdFilter || item.workspace_id === workspaceIdFilter) &&
            (!taskIds || taskIds.includes(item.task_id))
          );
        });

        resolve({
          data: headMode ? null : filteredItems,
          count: countMode ? filteredItems.length : null,
          error: null,
        });
        return;
      }

      resolve({ data: null, error: null });
    },
  };

  return query;
}
