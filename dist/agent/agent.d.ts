import type { CrmClient } from "../crm/types.js";
import type { LlmClient } from "../llm/types.js";
import type { ConversationSession } from "./session.js";
export interface AgentConfig {
    llmClient: LlmClient;
    crmClient: CrmClient;
}
export declare class Agent {
    private readonly config;
    constructor(config: AgentConfig);
    respond(session: ConversationSession, userMessage: string): Promise<string | undefined>;
    private runToolCalls;
}
//# sourceMappingURL=agent.d.ts.map