import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import { SessionStore } from "../agent/session.js";
import * as anthropicProviderModule from "../llm/anthropicProvider.js";

const INTERNAL_AGENT_SECRET = "test-internal-secret";

function buildApp() {
    const app = createApp({
        sessionStore: new SessionStore(),
        models: { anthropic: "claude-sonnet-4-6", openai: "gpt-4o", gemini: "gemini-2.0-flash" },
        internalAgentSecret: INTERNAL_AGENT_SECRET,
    });

    return { app };
}

function validBody(overrides: Record<string, unknown> = {}) {
    return {
        companyId: 1,
        crmBaseUrl: "https://crm.test",
        crmApiKey: "token",
        phone: "+15551234567",
        contactName: "Jane",
        message: "hola",
        llmProvider: "CLAUDE",
        llmApiKey: "sk-ant-test",
        ...overrides,
    };
}

describe("GET /health", () => {
    it("returns ok", async () => {
        const { app } = buildApp();
        const response = await request(app).get("/health");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "ok" });
    });
});

describe("POST /internal/respond", () => {
    it("rejects requests without a valid internal secret", async () => {
        const { app } = buildApp();
        const response = await request(app).post("/internal/respond").send(validBody());
        expect(response.status).toBe(401);
    });

    it("rejects an invalid body", async () => {
        const { app } = buildApp();
        const response = await request(app)
            .post("/internal/respond")
            .set("X-Internal-Secret", INTERNAL_AGENT_SECRET)
            .send({ companyId: 1 });
        expect(response.status).toBe(400);
    });

    it("returns the agent reply for a valid request", async () => {
        vi.spyOn(anthropicProviderModule.AnthropicProvider.prototype, "createMessage").mockResolvedValue({
            text: "¡Hola!",
            toolCalls: [],
            stopReason: "end",
        });

        const { app } = buildApp();
        const response = await request(app)
            .post("/internal/respond")
            .set("X-Internal-Secret", INTERNAL_AGENT_SECRET)
            .send(validBody());

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ reply: "¡Hola!" });

        vi.restoreAllMocks();
    });
});
