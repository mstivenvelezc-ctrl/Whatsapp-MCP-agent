import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import type Anthropic from "@anthropic-ai/sdk";
import { createApp } from "./app.js";
import { SessionStore } from "../agent/session.js";

const INTERNAL_AGENT_SECRET = "test-internal-secret";

function buildApp() {
    const anthropic = { messages: { create: vi.fn() } } as unknown as Anthropic;

    const app = createApp({
        sessionStore: new SessionStore(),
        anthropic,
        model: "claude-sonnet-4-6",
        internalAgentSecret: INTERNAL_AGENT_SECRET,
    });

    return { app, anthropic };
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
    function textMessage(text: string): Anthropic.Message {
        return {
            id: "msg_1",
            type: "message",
            role: "assistant",
            model: "claude-sonnet-4-6",
            stop_reason: "end_turn",
            stop_sequence: null,
            content: [{ type: "text", text, citations: null }],
            usage: { input_tokens: 1, output_tokens: 1 },
        } as unknown as Anthropic.Message;
    }

    function validBody(overrides: Record<string, unknown> = {}) {
        return {
            companyId: 1,
            crmBaseUrl: "https://crm.test",
            crmApiKey: "token",
            phone: "+15551234567",
            contactName: "Jane",
            message: "hola",
            ...overrides,
        };
    }

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
        const { app, anthropic } = buildApp();
        (anthropic.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue(textMessage("¡Hola!"));

        const response = await request(app)
            .post("/internal/respond")
            .set("X-Internal-Secret", INTERNAL_AGENT_SECRET)
            .send(validBody());

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ reply: "¡Hola!" });
    });
});
