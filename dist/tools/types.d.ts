import type { z } from "zod";
import type { CrmClient } from "../crm/types.js";
import type { ConversationSession } from "../agent/session.js";
export interface ToolContext {
    session: ConversationSession;
    crmClient: CrmClient;
}
export interface Tool<Schema extends z.ZodType = z.ZodType> {
    name: string;
    description: string;
    inputSchema: Schema;
    execute(input: z.infer<Schema>, context: ToolContext): Promise<unknown>;
}
export declare function defineTool<Schema extends z.ZodType>(tool: Tool<Schema>): Tool<Schema>;
//# sourceMappingURL=types.d.ts.map