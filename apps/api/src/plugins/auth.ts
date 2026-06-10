import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  preHandlerHookHandler,
} from "fastify";

export type AuthenticatedUser = {
  id: string;
  email?: string;
  accessToken: string;
};

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

const roleRank: Record<WorkspaceRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

declare module "fastify" {
  interface FastifyInstance {
    requireUser: preHandlerHookHandler;
    requireWorkspaceMember: preHandlerHookHandler;
    requireWorkspaceRole: (roles: WorkspaceRole[]) => preHandlerHookHandler;
  }
}

export async function authPlugin(app: FastifyInstance) {
  app.decorate("requireUser", requireUser);
  app.decorate("requireWorkspaceMember", requireWorkspaceMember);
  app.decorate("requireWorkspaceRole", requireWorkspaceRole);
}

async function requireUser(request: FastifyRequest, reply: FastifyReply) {
  if (!request.server.supabase) {
    return reply.code(503).send({
      error: "Supabase is not configured.",
    });
  }

  const token = getBearerToken(request);

  if (!token) {
    return reply.code(401).send({
      error: "Missing bearer token.",
    });
  }

  const { data, error } = await request.server.supabase.auth.getUser(token);

  if (error || !data.user) {
    return reply.code(401).send({
      error: "Invalid bearer token.",
    });
  }

  request.user = {
    id: data.user.id,
    email: data.user.email,
    accessToken: token,
  };
}

async function requireWorkspaceMember(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userResult = await ensureUser(request, reply);
  if (!userResult) return;

  const workspaceId = getWorkspaceId(request);

  if (!workspaceId) {
    return reply.code(400).send({
      error: "Missing workspace id.",
    });
  }

  const role = await getWorkspaceRole(request, workspaceId, userResult.id);

  if (!role) {
    return reply.code(403).send({
      error: "Workspace access denied.",
    });
  }
}

function requireWorkspaceRole(roles: WorkspaceRole[]): preHandlerHookHandler {
  return async (request, reply) => {
    const userResult = await ensureUser(request, reply);
    if (!userResult) return;

    const workspaceId = getWorkspaceId(request);

    if (!workspaceId) {
      return reply.code(400).send({
        error: "Missing workspace id.",
      });
    }

    const role = await getWorkspaceRole(request, workspaceId, userResult.id);

    if (!role || !roles.some((allowedRole) => roleAllows(role, allowedRole))) {
      return reply.code(403).send({
        error: "Workspace role denied.",
      });
    }
  };
}

async function ensureUser(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    await requireUser(request, reply);
  }

  return request.user;
}

function getBearerToken(request: FastifyRequest) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim() || null;
}

function getWorkspaceId(request: FastifyRequest) {
  const params = request.params;

  if (
    params &&
    typeof params === "object" &&
    "workspaceId" in params &&
    typeof params.workspaceId === "string"
  ) {
    return params.workspaceId;
  }

  return null;
}

async function getWorkspaceRole(
  request: FastifyRequest,
  workspaceId: string,
  userId: string,
) {
  if (!request.user) return null;

  const supabase = request.server.createSupabaseForUser(
    request.user.accessToken,
  );

  if (!supabase) return null;

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !isWorkspaceRole(data?.role)) {
    return null;
  }

  return data.role;
}

function roleAllows(actualRole: WorkspaceRole, requiredRole: WorkspaceRole) {
  return roleRank[actualRole] >= roleRank[requiredRole];
}

function isWorkspaceRole(value: unknown): value is WorkspaceRole {
  return (
    value === "owner" ||
    value === "admin" ||
    value === "member" ||
    value === "viewer"
  );
}
