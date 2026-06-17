import { describe, expect, it, vi } from "vitest";
import { CloudApiWhatsappClient } from "./client.js";
import { UpstreamServiceError } from "../lib/errors.js";

describe("CloudApiWhatsappClient", () => {
    it("sends a text message to the Cloud API with the expected payload", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
        const client = new CloudApiWhatsappClient({
            accessToken: "token",
            phoneNumberId: "123",
            apiVersion: "v21.0",
            fetchImpl,
        });

        await client.sendTextMessage("+15551234567", "Hola!");

        expect(fetchImpl).toHaveBeenCalledWith(
            "https://graph.facebook.com/v21.0/123/messages",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({ Authorization: "Bearer token" }),
            }),
        );
        const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
        expect(JSON.parse(init.body as string)).toEqual({
            messaging_product: "whatsapp",
            to: "+15551234567",
            type: "text",
            text: { body: "Hola!" },
        });
    });

    it("throws UpstreamServiceError when the API responds with an error status", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(new Response("bad request", { status: 400 }));
        const client = new CloudApiWhatsappClient({
            accessToken: "token",
            phoneNumberId: "123",
            apiVersion: "v21.0",
            fetchImpl,
        });

        await expect(client.sendTextMessage("+1", "hi")).rejects.toBeInstanceOf(UpstreamServiceError);
    });

    it("throws UpstreamServiceError when fetch itself fails", async () => {
        const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
        const client = new CloudApiWhatsappClient({
            accessToken: "token",
            phoneNumberId: "123",
            apiVersion: "v21.0",
            fetchImpl,
        });

        await expect(client.sendTextMessage("+1", "hi")).rejects.toBeInstanceOf(UpstreamServiceError);
    });
});
