import type { FastifyInstance } from "fastify";
import { z } from "zod";

const projectStatusSchema = z.enum(["active", "paused", "archived"]);

const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(100),
  key: z
    .string()
    .trim()
    .min(2)
    .max(12)
    .regex(/^[A-Z][A-Z0-9]*$/)
    .optional(),
  description: z.string().trim().max(500).optional(),
});

const updateProjectSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    key: z
      .string()
      .trim()
      .min(2)
      .max(12)
      .regex(/^[A-Z][A-Z0-9]*$/)
      .optional(),
    description: z.string().trim().max(500).nullable().optional(),
    status: projectStatusSchema.optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.key !== undefined ||
      value.description !== undefined ||
      value.status !== undefined,
    {
      message: "Provide project details to update.",
    },
  );

const projectColumns =
  "id, workspace_id, name, key, description, status, created_by, created_at, updated_at";

export async function projectRoutes(app: FastifyInstance) {
  app.get(
    "/workspaces/:workspaceId/projects",
    {
      preHandler: [app.requireWorkspaceMember],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({ error: "Authentication required." });
      }

      const supabase = app.createSupabaseForUser(request.user.accessToken);

      if (!supabase) {
        return reply.code(503).send({ error: "Supabase is not configured." });
      }

      const { workspaceId } = request.params as { workspaceId: string };
      const { data, error } = await supabase
        .from("projects")
        .select(projectColumns)
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) {
        request.log.error({ error }, "Could not list projects");
        return reply.code(500).send({ error: error.message });
      }

      return { projects: data ?? [] };
    },
  );

  app.post(
    "/workspaces/:workspaceId/projects",
    {
      preHandler: [app.requireWorkspaceRole(["member"])],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({ error: "Authentication required." });
      }

      const supabase = app.createSupabaseForUser(request.user.accessToken);

      if (!supabase) {
        return reply.code(503).send({ error: "Supabase is not configured." });
      }

      const parsed = createProjectSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "Invalid project payload.",
          issues: parsed.error.issues,
        });
      }

      const { workspaceId } = request.params as { workspaceId: string };
      const { data, error } = await supabase
        .from("projects")
        .insert({
          id: crypto.randomUUID(),
          workspace_id: workspaceId,
          name: parsed.data.name,
          key: parsed.data.key ?? buildProjectKey(parsed.data.name),
          description: parsed.data.description || null,
          created_by: request.user.id,
        })
        .select(projectColumns)
        .single();

      if (error) {
        request.log.error({ error }, "Could not create project");
        return reply.code(500).send({ error: error.message });
      }

      return reply.code(201).send({ project: data });
    },
  );

  app.patch(
    "/workspaces/:workspaceId/projects/:projectId",
    {
      preHandler: [app.requireWorkspaceRole(["member"])],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({ error: "Authentication required." });
      }

      const supabase = app.createSupabaseForUser(request.user.accessToken);

      if (!supabase) {
        return reply.code(503).send({ error: "Supabase is not configured." });
      }

      const parsed = updateProjectSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "Invalid project payload.",
          issues: parsed.error.issues,
        });
      }

      const { workspaceId, projectId } = request.params as {
        workspaceId: string;
        projectId: string;
      };
      const { data, error } = await supabase
        .from("projects")
        .update(parsed.data)
        .eq("workspace_id", workspaceId)
        .eq("id", projectId)
        .select(projectColumns)
        .single();

      if (error) {
        request.log.error({ error }, "Could not update project");
        return reply.code(500).send({ error: error.message });
      }

      return { project: data };
    },
  );

  app.post(
    "/workspaces/:workspaceId/projects/:projectId/archive",
    {
      preHandler: [app.requireWorkspaceRole(["member"])],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({ error: "Authentication required." });
      }

      const supabase = app.createSupabaseForUser(request.user.accessToken);

      if (!supabase) {
        return reply.code(503).send({ error: "Supabase is not configured." });
      }

      const { workspaceId, projectId } = request.params as {
        workspaceId: string;
        projectId: string;
      };
      const { data, error } = await supabase
        .from("projects")
        .update({ status: "archived" })
        .eq("workspace_id", workspaceId)
        .eq("id", projectId)
        .select(projectColumns)
        .single();

      if (error) {
        request.log.error({ error }, "Could not archive project");
        return reply.code(500).send({ error: error.message });
      }

      return { project: data };
    },
  );
}

function buildProjectKey(name: string) {
  const initials = name
    .split(/\s+/)
    .map((part) => part.replace(/[^a-zA-Z0-9]/g, "").charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 4);

  return `${initials || "PROJ"}${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
}
