import { UpstreamServiceError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { dispatchTool, getToolDefinitions } from "../tools/registry.js";
import { SYSTEM_PROMPT } from "./systemPrompt.js";
const MAX_TOOL_ITERATIONS = 6;
const MAX_TOKENS = 1024;
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
        session.history.push({ role: "user", content: userMessage });
        for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
            const response = await this.createMessage(session.history);
            session.history.push({ role: "assistant", content: response.content });
            if (response.stop_reason !== "tool_use") {
                return extractText(response.content);
            }
            const toolResults = await this.runToolUseBlocks(response.content, session);
            session.history.push({ role: "user", content: toolResults });
        }
        logger.warn("Max tool iterations reached", { phone: session.phone });
        return "Lo siento, no pude completar tu solicitud en este momento. ¿Quieres hablar con un asesor?";
    }
    async createMessage(messages) {
        try {
            return await this.config.anthropic.messages.create({
                model: this.config.model,
                max_tokens: MAX_TOKENS,
                system: SYSTEM_PROMPT,
                tools: getToolDefinitions(),
                messages,
            });
        }
        catch (error) {
            throw new UpstreamServiceError("anthropic", "Failed to get a response from Anthropic", error);
        }
    }
    async runToolUseBlocks(content, session) {
        const toolUseBlocks = content.filter((block) => block.type === "tool_use");
        const results = [];
        for (const block of toolUseBlocks) {
            const { output, isError } = await dispatchTool(block.name, block.input, {
                session,
                crmClient: this.config.crmClient,
            });
            results.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: JSON.stringify(output),
                is_error: isError,
            });
        }
        return results;
    }
}
function extractText(content) {
    return content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim();
}
//# sourceMappingURL=agent.js.map