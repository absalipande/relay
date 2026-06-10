import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppConfig } from "../config/env.js";
import type { AuthenticatedUser } from "../plugins/auth.js";

declare module "fastify" {
  interface FastifyInstance {
    config: AppConfig;
    supabase: SupabaseClient | null;
    createSupabaseForUser: (accessToken: string) => SupabaseClient | null;
  }

  interface FastifyRequest {
    user: AuthenticatedUser | null;
  }
}
