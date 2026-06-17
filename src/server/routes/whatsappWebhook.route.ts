import { Router } from "express";
import type { Agent } from "../../agent/agent.js";
import type { SessionStore } from "../../agent/session.js";
import type { WhatsappClient } from "../../whatsapp/client.js";
import type { CrmClient } from "../../crm/types.js";
import { extractIncomingMessages, whatsappWebhookPayloadSchema } from "../../whatsapp/types.js";
import { logger } from "../../lib/logger.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { verifyWhatsappWebhookSignature } from "../middleware/verifyWhatsappWebhookSignature.js";

export interface WhatsappWebhookRouterDeps {
    agent: Agent;
    sessionStore: SessionStore;
    whatsappClient: WhatsappClient;
    crmClient: CrmClient;
    verifyToken: string;
    appSecret: string;
}

function logConversationMessage(
    crmClient: CrmClient,
    clientPhone: string,
    clientName: string | undefined,
    messageType: "USER" | "BOT",
    messageContent: string,
): void {
    crmClient
        .logMessage({
            clientPhone,
            messageType,
            messageContent,
            ...(clientName !== undefined ? { clientName } : {}),
        })
        .catch((error) => {
            logger.warn("Failed to log conversation message in CRM", { clientPhone, messageType, error });
        });
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
                logConversationMessage(deps.crmClient, message.from, message.contactName, "USER", message.text);

                const reply = await deps.agent.respond(session, message.text);
                deps.sessionStore.save(session);

                if (reply) {
                    await deps.whatsappClient.sendTextMessage(message.from, reply);
                    logConversationMessage(deps.crmClient, message.from, session.contactName, "BOT", reply);
                }
            }

            res.sendStatus(200);
        }),
    );

    return router;
}
