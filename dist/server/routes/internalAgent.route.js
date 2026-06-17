import { Router } from "express";
import { z } from "zod";
import { Agent } from "../../agent/agent.js";
import { RestCrmClient } from "../../crm/restCrmClient.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { logConversationMessage } from "../conversationLogging.js";
const respondBodySchema = z.object({
    companyId: z.number().int().positive(),
    crmBaseUrl: z.string().url(),
    crmApiKey: z.string().min(1),
    phone: z.string().min(1),
    contactName: z.string().optional(),
    message: z.string().min(1),
});
export function internalAgentRouter(deps) {
    const router = Router();
    router.post("/respond", asyncHandler(async (req, res) => {
        if (req.header("X-Internal-Secret") !== deps.internalAgentSecret) {
            res.sendStatus(401);
            return;
        }
        const parsed = respondBodySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: "Invalid request body", issues: parsed.error.issues });
            return;
        }
        const { companyId, crmBaseUrl, crmApiKey, phone, contactName, message } = parsed.data;
        const crmClient = new RestCrmClient({ baseUrl: crmBaseUrl, apiKey: crmApiKey });
        const agent = new Agent({ anthropic: deps.anthropic, model: deps.model, crmClient });
        const sessionKey = `${companyId}:${phone}`;
        const session = deps.sessionStore.getOrCreate(sessionKey, phone, contactName);
        logConversationMessage(crmClient, phone, contactName, "USER", message);
        const reply = await agent.respond(session, message);
        deps.sessionStore.save(session);
        if (reply) {
            logConversationMessage(crmClient, phone, session.contactName, "BOT", reply);
        }
        res.status(200).json({ reply: reply ?? null });
    }));
    return router;
}
//# sourceMappingURL=internalAgent.route.js.map