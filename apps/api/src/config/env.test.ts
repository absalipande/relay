import { describe, expect, it } from "vitest";
import { loadConfig } from "./env.js";

describe("loadConfig", () => {
  it("uses local defaults", () => {
    expect(loadConfig({})).toMatchObject({
      NODE_ENV: "development",
      HOST: "0.0.0.0",
      PORT: 4000,
      WEB_ORIGIN: "http://localhost:3000",
    });
  });

  it("validates URL-shaped values", () => {
    expect(() =>
      loadConfig({
        WEB_ORIGIN: "http://",
      }),
    ).toThrow("Invalid API environment");
  });
});
