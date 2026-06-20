import { beforeEach, describe, expect, it } from "vitest";
import { loadEnv, resetEnvCacheForTests } from "./env.js";

const VALID_ENV = {
    INTERNAL_AGENT_SECRET: "internal-secret",
};

beforeEach(() => {
    resetEnvCacheForTests();
});

describe("loadEnv", () => {
    it("parses a valid environment and applies defaults", () => {
        const env = loadEnv(VALID_ENV);

        expect(env.PORT).toBe(3000);
        expect(env.NODE_ENV).toBe("development");
        expect(env.ANTHROPIC_MODEL).toBe("claude-sonnet-4-6");
        expect(env.OPENAI_MODEL).toBe("gpt-4o");
        expect(env.GEMINI_MODEL).toBe("gemini-2.0-flash");
    });

    it("throws when INTERNAL_AGENT_SECRET is missing", () => {
        const { INTERNAL_AGENT_SECRET, ...incomplete } = VALID_ENV;
        expect(() => loadEnv(incomplete)).toThrow(/INTERNAL_AGENT_SECRET/);
    });
});
