import { Router } from "express";
import type { Agent } from "../../agent/agent.js";
import type { SessionStore } from "../../agent/session.js";
import type { WhatsappClient } from "../../whatsapp/client.js";
export interface WhatsappWebhookRouterDeps {
    agent: Agent;
    sessionStore: SessionStore;
    whatsappClient: WhatsappClient;
    verifyToken: string;
    appSecret: string;
}
export declare function whatsappWebhookRouter(deps: WhatsappWebhookRouterDeps): Router;
//# sourceMappingURL=whatsappWebhook.route.d.ts.map