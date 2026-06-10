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
  let selectedColumns = "";
  let deleteMode = false;

  const query = {
    select(columns: string) {
      selectedColumns = columns;
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

      resolve({ data: null, error: null });
    },
  };

  return query;
}
