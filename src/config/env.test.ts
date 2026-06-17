import { beforeEach, describe, expect, it } from "vitest";
import { loadEnv, resetEnvCacheForTests } from "./env.js";

const VALID_ENV = {
    ANTHROPIC_API_KEY: "sk-ant-test",
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
    });

    it("throws a descriptive error when a required variable is missing", () => {
        const { ANTHROPIC_API_KEY, ...incomplete } = VALID_ENV;
        expect(() => loadEnv(incomplete)).toThrow(/ANTHROPIC_API_KEY/);
    });

    it("throws when INTERNAL_AGENT_SECRET is missing", () => {
        const { INTERNAL_AGENT_SECRET, ...incomplete } = VALID_ENV;
        expect(() => loadEnv(incomplete)).toThrow(/INTERNAL_AGENT_SECRET/);
    });
});
