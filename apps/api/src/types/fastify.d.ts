import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppConfig } from "../config/env.js";

declare module "fastify" {
  interface FastifyInstance {
    config: AppConfig;
    supabase: SupabaseClient | null;
  }
}
