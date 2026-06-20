import { Router } from "express";
import { z } from "zod";
import { Agent } from "../../agent/agent.js";
import type { SessionStore } from "../../agent/session.js";
import { RestCrmClient } from "../../crm/restCrmClient.js";
import { createLlmClient, type LlmModels } from "../../llm/factory.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { logConversationMessage } from "../conversationLogging.js";

export interface InternalAgentRouterDeps {
    models: LlmModels;
    sessionStore: SessionStore;
    internalAgentSecret: string;
}

const respondBodySchema = z.object({
    companyId: z.number().int().positive(),
    crmBaseUrl: z.string().url(),
    crmApiKey: z.string().min(1),
    phone: z.string().min(1),
    contactName: z.string().optional(),
    message: z.string().min(1),
    llmProvider: z.enum(["CLAUDE", "OPENAI", "GEMINI"]).default("CLAUDE"),
    llmApiKey: z.string().min(1),
});

export function internalAgentRouter(deps: InternalAgentRouterDeps): Router {
    const router = Router();

    router.post(
        "/respond",
        asyncHandler(async (req, res) => {
            if (req.header("X-Internal-Secret") !== deps.internalAgentSecret) {
                res.sendStatus(401);
                return;
            }

            const parsed = respondBodySchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ error: "Invalid request body", issues: parsed.error.issues });
                return;
            }

            const { companyId, crmBaseUrl, crmApiKey, phone, contactName, message, llmProvider, llmApiKey } = parsed.data;

            const crmClient = new RestCrmClient({ baseUrl: crmBaseUrl, apiKey: crmApiKey });
            const llmClient = createLlmClient(llmProvider, llmApiKey, deps.models);
            const agent = new Agent({ llmClient, crmClient });

            const sessionKey = `${companyId}:${phone}`;
            const session = deps.sessionStore.getOrCreate(sessionKey, phone, contactName);

            logConversationMessage(crmClient, phone, contactName, "USER", message);

            const reply = await agent.respond(session, message);
            deps.sessionStore.save(session);

            if (reply) {
                logConversationMessage(crmClient, phone, session.contactName, "BOT", reply);
            }

            res.status(200).json({ reply: reply ?? null });
        }),
    );

    return router;
}
