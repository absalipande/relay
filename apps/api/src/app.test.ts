import { describe, expect, it } from "vitest";
import { buildApp } from "./app.js";

const testConfig = {
  NODE_ENV: "test" as const,
  HOST: "127.0.0.1",
  PORT: 4000,
  WEB_ORIGIN: "http://localhost:3000",
  SUPABASE_URL: undefined,
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
});
