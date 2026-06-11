import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";
import { loadConfig, type AppConfig } from "./config/env.js";
import {
  createSupabaseAdminClient,
  createSupabaseUserClient,
} from "./lib/supabase.js";
import { authPlugin } from "./plugins/auth.js";
import { healthRoutes } from "./routes/health.js";
import { projectRoutes } from "./routes/projects.js";
import { taskRoutes } from "./routes/tasks.js";
import { workspaceRoutes } from "./routes/workspaces.js";
import type { SupabaseClient } from "@supabase/supabase-js";

type BuildAppDependencies = {
  supabase?: SupabaseClient | null;
  createSupabaseForUser?: (accessToken: string) => SupabaseClient | null;
};

export async function buildApp(
  config: AppConfig = loadConfig(),
  dependencies: BuildAppDependencies = {},
) {
  const app = Fastify({
    logger: config.NODE_ENV !== "test",
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: config.WEB_ORIGIN,
    credentials: true,
  });

  app.decorate("config", config);
  app.decorate(
    "supabase",
    dependencies.supabase ?? createSupabaseAdminClient(config),
  );
  app.decorate(
    "createSupabaseForUser",
    dependencies.createSupabaseForUser ??
      ((accessToken: string) => createSupabaseUserClient(config, accessToken)),
  );
  app.decorateRequest("user", null);

  await authPlugin(app);
  await app.register(healthRoutes);
  await app.register(workspaceRoutes);
  await app.register(projectRoutes);
  await app.register(taskRoutes);

  return app;
}
