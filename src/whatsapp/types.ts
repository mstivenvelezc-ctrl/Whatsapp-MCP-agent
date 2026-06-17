import { z } from "zod";

export const whatsappWebhookPayloadSchema = z.object({
    object: z.string(),
    entry: z.array(
        z.object({
            id: z.string(),
            changes: z.array(
                z.object({
                    field: z.string(),
                    value: z.object({
                        messaging_product: z.literal("whatsapp"),
                        metadata: z
                            .object({
                                display_phone_number: z.string().optional(),
                                phone_number_id: z.string().optional(),
                            })
                            .optional(),
                        contacts: z
                            .array(
                                z.object({
                                    profile: z.object({ name: z.string().optional() }).optional(),
                                    wa_id: z.string(),
                                }),
                            )
                            .optional(),
                        messages: z
                            .array(
                                z.object({
                                    from: z.string(),
                                    id: z.string(),
                                    timestamp: z.string().optional(),
                                    type: z.string(),
                                    text: z.object({ body: z.string() }).optional(),
                                    interactive: z
                                        .object({
                                            type: z.string(),
                                            button_reply: z
                                                .object({ id: z.string(), title: z.string() })
                                                .optional(),
                                            list_reply: z
                                                .object({ id: z.string(), title: z.string() })
                                                .optional(),
                                        })
                                        .optional(),
                                }),
                            )
                            .optional(),
                    }),
                }),
            ),
        }),
    ),
});

export type WhatsappWebhookPayload = z.infer<typeof whatsappWebhookPayloadSchema>;

export interface IncomingWhatsappMessage {
    from: string;
    waMessageId: string;
    text: string;
    contactName: string | undefined;
}

export function extractIncomingMessages(payload: WhatsappWebhookPayload): IncomingWhatsappMessage[] {
    const messages: IncomingWhatsappMessage[] = [];

    for (const entry of payload.entry) {
        for (const change of entry.changes) {
            const value = change.value;
            const contactName = value.contacts?.[0]?.profile?.name;

            for (const message of value.messages ?? []) {
                const text =
                    message.text?.body ??
                    message.interactive?.button_reply?.title ??
                    message.interactive?.list_reply?.title;

                if (text === undefined) continue;

                messages.push({
                    from: message.from,
                    waMessageId: message.id,
                    text,
                    contactName,
                });
            }
        }
    }

    return messages;
}
