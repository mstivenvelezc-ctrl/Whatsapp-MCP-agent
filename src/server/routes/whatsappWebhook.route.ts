import { Router } from "express";
import type { Agent } from "../../agent/agent.js";
import type { SessionStore } from "../../agent/session.js";
import type { WhatsappClient } from "../../whatsapp/client.js";
import { extractIncomingMessages, whatsappWebhookPayloadSchema } from "../../whatsapp/types.js";
import { logger } from "../../lib/logger.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { verifyWhatsappWebhookSignature } from "../middleware/verifyWhatsappWebhookSignature.js";

export interface WhatsappWebhookRouterDeps {
    agent: Agent;
    sessionStore: SessionStore;
    whatsappClient: WhatsappClient;
    verifyToken: string;
    appSecret: string;
}

export function whatsappWebhookRouter(deps: WhatsappWebhookRouterDeps): Router {
    const router = Router();

    router.get("/", (req, res) => {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (mode === "subscribe" && token === deps.verifyToken) {
            res.status(200).send(challenge);
            return;
        }

        res.sendStatus(403);
    });

    router.post(
        "/",
        verifyWhatsappWebhookSignature(deps.appSecret),
        asyncHandler(async (req, res) => {
            const parsed = whatsappWebhookPayloadSchema.safeParse(req.body);
            if (!parsed.success) {
                logger.warn("Ignoring unrecognized WhatsApp webhook payload", { issues: parsed.error.issues });
                res.sendStatus(200);
                return;
            }

            const incomingMessages = extractIncomingMessages(parsed.data);

            for (const message of incomingMessages) {
                const session = deps.sessionStore.getOrCreate(message.from, message.contactName);
                const reply = await deps.agent.respond(session, message.text);
                deps.sessionStore.save(session);

                if (reply) {
                    await deps.whatsappClient.sendTextMessage(message.from, reply);
                }
            }

            res.sendStatus(200);
        }),
    );

    return router;
}
