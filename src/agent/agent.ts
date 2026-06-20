import { logger } from "../lib/logger.js";
import { dispatchTool, getToolDefinitions } from "../tools/registry.js";
import type { CrmClient } from "../crm/types.js";
import type { LlmClient, LlmToolResult } from "../llm/types.js";
import type { ConversationSession } from "./session.js";
import { SYSTEM_PROMPT } from "./systemPrompt.js";

const MAX_TOOL_ITERATIONS = 6;

export interface AgentConfig {
    llmClient: LlmClient;
    crmClient: CrmClient;
}

export class Agent {
    constructor(private readonly config: AgentConfig) {}

    async respond(session: ConversationSession, userMessage: string): Promise<string | undefined> {
        if (session.stage === "handed_off_to_advisor") {
            logger.info("Skipping bot response: conversation handed off to advisor", { phone: session.phone });
            return undefined;
        }

        session.history.push({ role: "user", text: userMessage });

        for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
            const response = await this.config.llmClient.createMessage(
                SYSTEM_PROMPT,
                session.history,
                getToolDefinitions(),
            );
            session.history.push({
                role: "assistant",
                ...(response.text !== undefined ? { text: response.text } : {}),
                toolCalls: response.toolCalls,
            });

            if (response.stopReason !== "tool_use") {
                return response.text ?? "";
            }

            const toolResults = await this.runToolCalls(response.toolCalls, session);
            session.history.push({ role: "user", toolResults });
        }

        logger.warn("Max tool iterations reached", { phone: session.phone });
        return "Lo siento, no pude completar tu solicitud en este momento. ¿Quieres hablar con un asesor?";
    }

    private async runToolCalls(
        toolCalls: { id: string; name: string; input: unknown }[],
        session: ConversationSession,
    ): Promise<LlmToolResult[]> {
        const results: LlmToolResult[] = [];
        for (const toolCall of toolCalls) {
            const { output, isError } = await dispatchTool(toolCall.name, toolCall.input, {
                session,
                crmClient: this.config.crmClient,
            });

            results.push({ id: toolCall.id, name: toolCall.name, output, isError });
        }
        return results;
    }
}
