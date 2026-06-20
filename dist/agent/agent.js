import { logger } from "../lib/logger.js";
import { dispatchTool, getToolDefinitions } from "../tools/registry.js";
import { SYSTEM_PROMPT } from "./systemPrompt.js";
const MAX_TOOL_ITERATIONS = 6;
export class Agent {
    config;
    constructor(config) {
        this.config = config;
    }
    async respond(session, userMessage) {
        if (session.stage === "handed_off_to_advisor") {
            logger.info("Skipping bot response: conversation handed off to advisor", { phone: session.phone });
            return undefined;
        }
        session.history.push({ role: "user", text: userMessage });
        for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
            const response = await this.config.llmClient.createMessage(SYSTEM_PROMPT, session.history, getToolDefinitions());
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
    async runToolCalls(toolCalls, session) {
        const results = [];
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
//# sourceMappingURL=agent.js.map