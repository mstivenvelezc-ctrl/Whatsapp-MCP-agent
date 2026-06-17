import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import { SessionStore } from "../agent/session.js";
import type { Agent } from "../agent/agent.js";
import type { WhatsappClient } from "../whatsapp/client.js";

const APP_SECRET = "test-app-secret";
const VERIFY_TOKEN = "test-verify-token";

function sign(body: string): string {
    return `sha256=${createHmac("sha256", APP_SECRET).update(body).digest("hex")}`;
}

function buildApp(agentRespond: ReturnType<typeof vi.fn>) {
    const sendTextMessage = vi.fn().mockResolvedValue(undefined);
    const agent = { respond: agentRespond } as unknown as Agent;
    const whatsappClient = { sendTextMessage } as unknown as WhatsappClient;

    const app = createApp({
        agent,
        sessionStore: new SessionStore(),
        whatsappClient,
        whatsappVerifyToken: VERIFY_TOKEN,
        whatsappAppSecret: APP_SECRET,
    });

    return { app, sendTextMessage };
}

function incomingMessagePayload(text: string) {
    return JSON.stringify({
        object: "whatsapp_business_account",
        entry: [
            {
                id: "entry-1",
                changes: [
                    {
                        field: "messages",
                        value: {
                            messaging_product: "whatsapp",
                            contacts: [{ profile: { name: "Jane" }, wa_id: "+15551234567" }],
                            messages: [{ from: "+15551234567", id: "wamid.1", type: "text", text: { body: text } }],
                        },
                    },
                ],
            },
        ],
    });
}

describe("GET /health", () => {
    it("returns ok", async () => {
        const { app } = buildApp(vi.fn());
        const response = await request(app).get("/health");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "ok" });
    });
});

describe("GET /webhooks/whatsapp", () => {
    it("echoes the challenge when the verify token matches", async () => {
        const { app } = buildApp(vi.fn());
        const response = await request(app)
            .get("/webhooks/whatsapp")
            .query({ "hub.mode": "subscribe", "hub.verify_token": VERIFY_TOKEN, "hub.challenge": "12345" });

        expect(response.status).toBe(200);
        expect(response.text).toBe("12345");
    });

    it("rejects an incorrect verify token", async () => {
        const { app } = buildApp(vi.fn());
        const response = await request(app)
            .get("/webhooks/whatsapp")
            .query({ "hub.mode": "subscribe", "hub.verify_token": "wrong", "hub.challenge": "12345" });

        expect(response.status).toBe(403);
    });
});

describe("POST /webhooks/whatsapp", () => {
    it("rejects requests with an invalid signature", async () => {
        const { app } = buildApp(vi.fn());
        const body = incomingMessagePayload("hola");

        const response = await request(app)
            .post("/webhooks/whatsapp")
            .set("Content-Type", "application/json")
            .set("X-Hub-Signature-256", "sha256=invalid")
            .send(body);

        expect(response.status).toBe(401);
    });

    it("processes an incoming message and replies through WhatsApp", async () => {
        const agentRespond = vi.fn().mockResolvedValue("¡Hola! ¿En qué te ayudo?");
        const { app, sendTextMessage } = buildApp(agentRespond);
        const body = incomingMessagePayload("hola");

        const response = await request(app)
            .post("/webhooks/whatsapp")
            .set("Content-Type", "application/json")
            .set("X-Hub-Signature-256", sign(body))
            .send(body);

        expect(response.status).toBe(200);
        expect(agentRespond).toHaveBeenCalledTimes(1);
        expect(sendTextMessage).toHaveBeenCalledWith("+15551234567", "¡Hola! ¿En qué te ayudo?");
    });

    it("does not send a WhatsApp reply when the agent stays silent (handed off to advisor)", async () => {
        const agentRespond = vi.fn().mockResolvedValue(undefined);
        const { app, sendTextMessage } = buildApp(agentRespond);
        const body = incomingMessagePayload("hola");

        const response = await request(app)
            .post("/webhooks/whatsapp")
            .set("Content-Type", "application/json")
            .set("X-Hub-Signature-256", sign(body))
            .send(body);

        expect(response.status).toBe(200);
        expect(sendTextMessage).not.toHaveBeenCalled();
    });
});
