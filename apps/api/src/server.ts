import { buildApp } from "./app.js";
import { loadConfig } from "./config/env.js";

const config = loadConfig();
const app = await buildApp(config);

try {
  await app.listen({ host: config.HOST, port: config.PORT });
  app.log.info(
    {
      supabaseUrl: Boolean(config.SUPABASE_URL),
      supabasePublishableKey: config.SUPABASE_PUBLISHABLE_KEY
        ? `${config.SUPABASE_PUBLISHABLE_KEY.slice(0, 12)}...`
        : null,
      supabaseServiceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY
        ? `${config.SUPABASE_SERVICE_ROLE_KEY.slice(0, 10)}...`
        : null,
    },
    "Supabase API config loaded",
  );
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
