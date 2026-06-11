import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";

const taskStatusSchema = z.enum(["todo", "in_progress", "done"]);
const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().date().nullable().optional(),
  checklistItems: z.array(z.string().trim().min(1).max(160)).max(20).optional(),
});

const updateTaskSchema = z
  .object({
    title: z.string().trim().min(2).max(160).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    assigneeId: z.string().uuid().nullable().optional(),
    dueDate: z.string().date().nullable().optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.description !== undefined ||
      value.status !== undefined ||
      value.priority !== undefined ||
      value.assigneeId !== undefined ||
      value.dueDate !== undefined,
    {
      message: "Provide task details to update.",
    },
  );

const createChecklistItemSchema = z.object({
  taskId: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
});

const updateChecklistItemSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    isDone: z.boolean().optional(),
    position: z.number().int().min(0).optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.isDone !== undefined ||
      value.position !== undefined,
    {
      message: "Provide checklist item details to update.",
    },
  );

const taskColumns =
  "id, workspace_id, project_id, title, description, status, priority, assignee_id, due_date, created_by, created_at, updated_at";

const checklistColumns =
  "id, task_id, workspace_id, title, is_done, position, created_at, updated_at";

export async function taskRoutes(app: FastifyInstance) {
  app.get(
    "/workspaces/:workspaceId/tasks",
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
      const projectId = getProjectId(request.query);
      let query = supabase
        .from("tasks")
        .select(taskColumns)
        .eq("workspace_id", workspaceId);

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data: tasks, error: taskError } = await query.order("created_at", {
        ascending: false,
      });

      if (taskError) {
        request.log.error({ error: taskError }, "Could not list tasks");
        return reply.code(500).send({ error: taskError.message });
      }

      const taskIds = (tasks ?? []).map((task) => task.id);
      const checklistItems = await listChecklistItems(app, request, taskIds);

      if ("error" in checklistItems) {
        return reply.code(500).send({ error: checklistItems.error });
      }

      return {
        tasks: (tasks ?? []).map((task) => ({
          ...task,
          checklist_items: checklistItems.data.filter(
            (item) => item.task_id === task.id,
          ),
        })),
      };
    },
  );

  app.post(
    "/workspaces/:workspaceId/tasks",
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

      const parsed = createTaskSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "Invalid task payload.",
          issues: parsed.error.issues,
        });
      }

      const { workspaceId } = request.params as { workspaceId: string };
      const projectBelongsToWorkspace = await ensureProjectInWorkspace(
        supabase,
        workspaceId,
        parsed.data.projectId,
      );

      if (!projectBelongsToWorkspace) {
        return reply.code(404).send({ error: "Project not found." });
      }

      const taskId = crypto.randomUUID();
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .insert({
          id: taskId,
          workspace_id: workspaceId,
          project_id: parsed.data.projectId,
          title: parsed.data.title,
          description: parsed.data.description || null,
          status: parsed.data.status ?? "todo",
          priority: parsed.data.priority ?? "medium",
          assignee_id: parsed.data.assigneeId ?? null,
          due_date: parsed.data.dueDate ?? null,
          created_by: request.user.id,
        })
        .select(taskColumns)
        .single();

      if (taskError) {
        request.log.error({ error: taskError }, "Could not create task");
        return reply.code(500).send({ error: taskError.message });
      }

      const checklistItems = await createInitialChecklistItems(
        supabase,
        workspaceId,
        taskId,
        parsed.data.checklistItems ?? [],
      );

      if ("error" in checklistItems) {
        return reply.code(500).send({ error: checklistItems.error });
      }

      return reply.code(201).send({
        task: {
          ...task,
          checklist_items: checklistItems.data,
        },
      });
    },
  );

  app.patch(
    "/workspaces/:workspaceId/tasks/:taskId",
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

      const parsed = updateTaskSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "Invalid task payload.",
          issues: parsed.error.issues,
        });
      }

      const { workspaceId, taskId } = request.params as {
        workspaceId: string;
        taskId: string;
      };
      const { data, error } = await supabase
        .from("tasks")
        .update({
          title: parsed.data.title,
          description: parsed.data.description,
          status: parsed.data.status,
          priority: parsed.data.priority,
          assignee_id: parsed.data.assigneeId,
          due_date: parsed.data.dueDate,
        })
        .eq("workspace_id", workspaceId)
        .eq("id", taskId)
        .select(taskColumns)
        .single();

      if (error) {
        request.log.error({ error }, "Could not update task");
        return reply.code(500).send({ error: error.message });
      }

      return { task: data };
    },
  );

  app.post(
    "/workspaces/:workspaceId/checklist-items",
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

      const parsed = createChecklistItemSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "Invalid checklist item payload.",
          issues: parsed.error.issues,
        });
      }

      const { workspaceId } = request.params as { workspaceId: string };
      const taskBelongsToWorkspace = await ensureTaskInWorkspace(
        supabase,
        workspaceId,
        parsed.data.taskId,
      );

      if (!taskBelongsToWorkspace) {
        return reply.code(404).send({ error: "Task not found." });
      }

      const { count } = await supabase
        .from("task_checklist_items")
        .select("id", { count: "exact", head: true })
        .eq("task_id", parsed.data.taskId);

      const { data, error } = await supabase
        .from("task_checklist_items")
        .insert({
          id: crypto.randomUUID(),
          workspace_id: workspaceId,
          task_id: parsed.data.taskId,
          title: parsed.data.title,
          position: count ?? 0,
        })
        .select(checklistColumns)
        .single();

      if (error) {
        request.log.error({ error }, "Could not create checklist item");
        return reply.code(500).send({ error: error.message });
      }

      return reply.code(201).send({ checklist_item: data });
    },
  );

  app.patch(
    "/workspaces/:workspaceId/checklist-items/:itemId",
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

      const parsed = updateChecklistItemSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "Invalid checklist item payload.",
          issues: parsed.error.issues,
        });
      }

      const { workspaceId, itemId } = request.params as {
        workspaceId: string;
        itemId: string;
      };
      const { data, error } = await supabase
        .from("task_checklist_items")
        .update({
          title: parsed.data.title,
          is_done: parsed.data.isDone,
          position: parsed.data.position,
        })
        .eq("workspace_id", workspaceId)
        .eq("id", itemId)
        .select(checklistColumns)
        .single();

      if (error) {
        request.log.error({ error }, "Could not update checklist item");
        return reply.code(500).send({ error: error.message });
      }

      return { checklist_item: data };
    },
  );
}

function getProjectId(query: unknown) {
  if (
    query &&
    typeof query === "object" &&
    "projectId" in query &&
    typeof query.projectId === "string" &&
    query.projectId.length > 0
  ) {
    return query.projectId;
  }

  return null;
}

async function ensureProjectInWorkspace(
  supabase: ReturnType<FastifyInstance["createSupabaseForUser"]>,
  workspaceId: string,
  projectId: string,
) {
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("id", projectId)
    .maybeSingle();

  return !error && Boolean(data);
}

async function ensureTaskInWorkspace(
  supabase: ReturnType<FastifyInstance["createSupabaseForUser"]>,
  workspaceId: string,
  taskId: string,
) {
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("tasks")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("id", taskId)
    .maybeSingle();

  return !error && Boolean(data);
}

async function createInitialChecklistItems(
  supabase: ReturnType<FastifyInstance["createSupabaseForUser"]>,
  workspaceId: string,
  taskId: string,
  checklistItems: string[],
) {
  if (!supabase || checklistItems.length === 0) {
    return { data: [] };
  }

  const rows = checklistItems.map((title, index) => ({
    id: crypto.randomUUID(),
    workspace_id: workspaceId,
    task_id: taskId,
    title,
    position: index,
  }));

  const { data, error } = await supabase
    .from("task_checklist_items")
    .insert(rows)
    .select(checklistColumns);

  if (error) {
    return { error: error.message };
  }

  return { data: data ?? [] };
}

async function listChecklistItems(
  app: FastifyInstance,
  request: FastifyRequest,
  taskIds: string[],
) {
  if (taskIds.length === 0 || !request.user) {
    return { data: [] };
  }

  const supabase = app.createSupabaseForUser(request.user.accessToken);

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { data, error } = await supabase
    .from("task_checklist_items")
    .select(checklistColumns)
    .in("task_id", taskIds)
    .order("position", { ascending: true });

  if (error) {
    request.log.error({ error }, "Could not list checklist items");
    return { error: error.message };
  }

  return { data: data ?? [] };
}
