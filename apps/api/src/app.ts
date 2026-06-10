import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";
import { loadConfig, type AppConfig } from "./config/env.js";
import { createSupabaseAdminClient } from "./lib/supabase.js";
import { healthRoutes } from "./routes/health.js";

export async function buildApp(config: AppConfig = loadConfig()) {
  const app = Fastify({
    logger: config.NODE_ENV !== "test",
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: config.WEB_ORIGIN,
    credentials: true,
  });

  app.decorate("config", config);
  app.decorate("supabase", createSupabaseAdminClient(config));

  await app.register(healthRoutes);

  return app;
}
