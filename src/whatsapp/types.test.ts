import { describe, expect, it } from "vitest";
import { extractIncomingMessages, whatsappWebhookPayloadSchema } from "./types.js";

function buildPayload(message: Record<string, unknown>) {
    return {
        object: "whatsapp_business_account",
        entry: [
            {
                id: "entry-id",
                changes: [
                    {
                        field: "messages",
                        value: {
                            messaging_product: "whatsapp",
                            contacts: [{ profile: { name: "Jane Doe" }, wa_id: "5551234567" }],
                            messages: [message],
                        },
                    },
                ],
            },
        ],
    };
}

describe("extractIncomingMessages", () => {
    it("extracts a plain text message", () => {
        const payload = whatsappWebhookPayloadSchema.parse(
            buildPayload({ from: "5551234567", id: "wamid.1", type: "text", text: { body: "Hola" } }),
        );

        const messages = extractIncomingMessages(payload);

        expect(messages).toEqual([
            { from: "5551234567", waMessageId: "wamid.1", text: "Hola", contactName: "Jane Doe" },
        ]);
    });

    it("extracts the title of an interactive button reply", () => {
        const payload = whatsappWebhookPayloadSchema.parse(
            buildPayload({
                from: "5551234567",
                id: "wamid.2",
                type: "interactive",
                interactive: { type: "button_reply", button_reply: { id: "agendar_cita", title: "Agendar cita" } },
            }),
        );

        const messages = extractIncomingMessages(payload);

        expect(messages[0]?.text).toBe("Agendar cita");
    });

    it("skips messages without extractable text (e.g. unsupported media)", () => {
        const payload = whatsappWebhookPayloadSchema.parse(
            buildPayload({ from: "5551234567", id: "wamid.3", type: "image" }),
        );

        expect(extractIncomingMessages(payload)).toEqual([]);
    });
});
