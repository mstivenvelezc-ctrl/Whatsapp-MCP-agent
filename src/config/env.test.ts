import { beforeEach, describe, expect, it } from "vitest";
import { loadEnv, resetEnvCacheForTests } from "./env.js";

const VALID_ENV = {
    ANTHROPIC_API_KEY: "sk-ant-test",
    WHATSAPP_ACCESS_TOKEN: "wa-token",
    WHATSAPP_PHONE_NUMBER_ID: "12345",
    WHATSAPP_VERIFY_TOKEN: "verify-token",
    WHATSAPP_APP_SECRET: "app-secret",
    CRM_BASE_URL: "https://crm.test",
    CRM_API_KEY: "crm-key",
};

beforeEach(() => {
    resetEnvCacheForTests();
});

describe("loadEnv", () => {
    it("parses a valid environment and applies defaults", () => {
        const env = loadEnv(VALID_ENV);

        expect(env.PORT).toBe(3000);
        expect(env.NODE_ENV).toBe("development");
        expect(env.WHATSAPP_API_VERSION).toBe("v21.0");
    });

    it("throws a descriptive error when a required variable is missing", () => {
        const { ANTHROPIC_API_KEY, ...incomplete } = VALID_ENV;
        expect(() => loadEnv(incomplete)).toThrow(/ANTHROPIC_API_KEY/);
    });

    it("throws when CRM_BASE_URL is not a valid URL", () => {
        expect(() => loadEnv({ ...VALID_ENV, CRM_BASE_URL: "not-a-url" })).toThrow(/CRM_BASE_URL/);
    });
});
