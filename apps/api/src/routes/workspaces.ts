import type { FastifyInstance } from "fastify";
import { z } from "zod";

const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
});

const updateWorkspaceSchema = createWorkspaceSchema.partial().refine(
  (value) => value.name !== undefined || value.slug !== undefined,
  {
    message: "Provide a workspace name or URL.",
  },
);

const workspaceIconSchema = z.object({
  icon_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .optional(),
  icon_initials: z
    .string()
    .trim()
    .min(1)
    .max(3)
    .regex(/^[A-Za-z0-9]+$/)
    .nullable()
    .optional(),
});

const updateWorkspacePayloadSchema = createWorkspaceSchema
  .partial()
  .merge(workspaceIconSchema)
  .refine(
    (value) =>
      value.name !== undefined ||
      value.slug !== undefined ||
      value.icon_initials !== undefined ||
      value.icon_color !== undefined,
    {
      message: "Provide workspace fields to update.",
    },
  );

type WorkspaceMembershipRow = {
  role: string;
  workspaces:
    | {
        id: string;
        icon_color: string | null;
        icon_initials: string | null;
        name: string;
        slug: string;
        created_at: string;
        last_opened_at: string | null;
        updated_at: string;
      }
    | {
        id: string;
        icon_color: string | null;
        icon_initials: string | null;
        name: string;
        slug: string;
        created_at: string;
        last_opened_at: string | null;
        updated_at: string;
      }[]
    | null;
};

export async function workspaceRoutes(app: FastifyInstance) {
  app.get(
    "/workspaces",
    {
      preHandler: [app.requireUser],
    },
    async (request, reply) => {
      if (!app.supabase || !request.user) {
        return reply.code(503).send({ error: "Supabase is not configured." });
      }

      const supabase = app.createSupabaseForUser(request.user.accessToken);

      if (!supabase) {
        return reply.code(503).send({ error: "Supabase is not configured." });
      }

      const { data, error } = await supabase
        .from("workspace_members")
        .select("role, workspaces(id, icon_color, icon_initials, name, slug, created_at, last_opened_at, updated_at)")
        .eq("user_id", request.user.id)
        .order("created_at", { ascending: true });

      if (error) {
        request.log.error({ error }, "Could not list workspaces");
        return reply.code(500).send({ error: error.message });
      }

      const workspaces = ((data ?? []) as WorkspaceMembershipRow[])
        .map((membership) => {
          const workspace = Array.isArray(membership.workspaces)
            ? membership.workspaces[0]
            : membership.workspaces;

          if (!workspace) return null;

          return {
            ...workspace,
            role: membership.role,
          };
        })
        .filter((workspace) => workspace !== null);

      return { workspaces };
    },
  );

  app.post(
    "/workspaces",
    {
      preHandler: [app.requireUser],
    },
    async (request, reply) => {
      if (!app.supabase || !request.user) {
        return reply.code(503).send({ error: "Supabase is not configured." });
      }

      const supabase = app.createSupabaseForUser(request.user.accessToken);

      if (!supabase) {
        return reply.code(503).send({ error: "Supabase is not configured." });
      }

      const parsed = createWorkspaceSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "Invalid workspace payload.",
          issues: parsed.error.issues,
        });
      }

      const workspaceId = crypto.randomUUID();
      const workspace = {
        id: workspaceId,
        name: parsed.data.name,
        slug: parsed.data.slug ?? buildWorkspaceSlug(parsed.data.name),
      };

      const { data: createdWorkspace, error: workspaceError } =
        await supabase.rpc("create_workspace_for_current_user", {
          workspace_id: workspace.id,
          workspace_name: workspace.name,
          workspace_slug: workspace.slug,
        });

      if (workspaceError) {
        request.log.error({ error: workspaceError }, "Could not create workspace");
        return reply.code(500).send({ error: workspaceError.message });
      }

      const workspaceRow = Array.isArray(createdWorkspace)
        ? createdWorkspace[0]
        : createdWorkspace;

      return reply.code(201).send({
        workspace: {
          ...workspaceRow,
          role: "owner",
        },
      });
    },
  );

  app.get(
    "/workspaces/:workspaceId",
    {
      preHandler: [app.requireWorkspaceMember],
    },
    async (request, reply) => {
      if (!app.supabase) {
        return reply.code(503).send({ error: "Supabase is not configured." });
      }

      const supabase = request.user
        ? app.createSupabaseForUser(request.user.accessToken)
        : null;

      if (!supabase) {
        return reply.code(503).send({ error: "Supabase is not configured." });
      }

      const { workspaceId } = request.params as { workspaceId: string };
      const { data, error } = await supabase
        .from("workspaces")
        .select("id, icon_color, icon_initials, name, slug, created_at, last_opened_at, updated_at")
        .eq("id", workspaceId)
        .single();

      if (error) {
        request.log.error({ error }, "Could not fetch workspace");
        return reply.code(404).send({ error: "Workspace not found." });
      }

      return { workspace: data };
    },
  );

  app.post(
    "/workspaces/:workspaceId/opened",
    {
      preHandler: [app.requireWorkspaceMember],
    },
    async (request, reply) => {
      if (!app.supabase || !request.user) {
        return reply.code(503).send({ error: "Supabase is not configured." });
      }

      const { workspaceId } = request.params as { workspaceId: string };
      const { data, error } = await app.supabase
        .from("workspaces")
        .update({ last_opened_at: new Date().toISOString() })
        .eq("id", workspaceId)
        .select("id, icon_color, icon_initials, name, slug, created_at, last_opened_at, updated_at")
        .single();

      if (error) {
        request.log.error({ error }, "Could not mark workspace as opened");
        return reply.code(500).send({ error: error.message });
      }

      return { workspace: data };
    },
  );

  app.patch(
    "/workspaces/:workspaceId",
    {
      preHandler: [app.requireWorkspaceRole(["admin"])],
    },
    async (request, reply) => {
      if (!app.supabase || !request.user) {
        return reply.code(503).send({ error: "Supabase is not configured." });
      }

      const supabase = app.createSupabaseForUser(request.user.accessToken);

      if (!supabase) {
        return reply.code(503).send({ error: "Supabase is not configured." });
      }

      const parsed = updateWorkspacePayloadSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "Invalid workspace payload.",
          issues: parsed.error.issues,
        });
      }

      const { workspaceId } = request.params as { workspaceId: string };
      const { data, error } = await supabase
        .from("workspaces")
        .update(parsed.data)
        .eq("id", workspaceId)
        .select("id, icon_color, icon_initials, name, slug, created_at, last_opened_at, updated_at")
        .single();

      if (error) {
        request.log.error({ error }, "Could not update workspace");
        return reply.code(500).send({ error: error.message });
      }

      return { workspace: data };
    },
  );

  app.delete(
    "/workspaces/:workspaceId",
    {
      preHandler: [app.requireWorkspaceRole(["owner"])],
    },
    async (request, reply) => {
      if (!app.supabase || !request.user) {
        return reply.code(503).send({ error: "Supabase is not configured." });
      }

      const supabase = app.createSupabaseForUser(request.user.accessToken);

      if (!supabase) {
        return reply.code(503).send({ error: "Supabase is not configured." });
      }

      const { workspaceId } = request.params as { workspaceId: string };
      const { error } = await supabase.rpc("delete_workspace_for_current_user", {
        target_workspace_id: workspaceId,
      });

      if (error) {
        request.log.error({ error }, "Could not delete workspace");
        return reply.code(500).send({ error: error.message });
      }

      return reply.code(204).send();
    },
  );
}

function buildWorkspaceSlug(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  const suffix = crypto.randomUUID().slice(0, 8);
  return `${base || "workspace"}-${suffix}`;
}
