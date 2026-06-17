import type Anthropic from "@anthropic-ai/sdk";
import type { CrmClient } from "../crm/types.js";
import type { ConversationSession } from "./session.js";
export interface AgentConfig {
    anthropic: Anthropic;
    model: string;
    crmClient: CrmClient;
}
export declare class Agent {
    private readonly config;
    constructor(config: AgentConfig);
    respond(session: ConversationSession, userMessage: string): Promise<string | undefined>;
    private createMessage;
    private runToolUseBlocks;
}
//# sourceMappingURL=agent.d.ts.map