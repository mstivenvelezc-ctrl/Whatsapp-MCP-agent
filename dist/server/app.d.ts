import { type Express } from "express";
import type { Agent } from "../agent/agent.js";
import type { SessionStore } from "../agent/session.js";
import type { WhatsappClient } from "../whatsapp/client.js";
export interface AppDeps {
    agent: Agent;
    sessionStore: SessionStore;
    whatsappClient: WhatsappClient;
    whatsappVerifyToken: string;
    whatsappAppSecret: string;
}
export declare function createApp(deps: AppDeps): Express;
//# sourceMappingURL=app.d.ts.map