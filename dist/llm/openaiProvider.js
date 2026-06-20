import OpenAI from "openai";
import { UpstreamServiceError } from "../lib/errors.js";
const MAX_TOKENS = 1024;
export class OpenAiProvider {
    model;
    client;
    constructor(apiKey, model) {
        this.model = model;
        this.client = new OpenAI({ apiKey });
    }
    async createMessage(systemPrompt, history, tools) {
        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                max_tokens: MAX_TOKENS,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history.flatMap(toOpenAiMessages),
                ],
                tools: tools.map(toOpenAiTool),
            });
            const choice = response.choices[0];
            const message = choice?.message;
            const toolCalls = (message?.tool_calls ?? [])
                .filter((toolCall) => toolCall.type === "function")
                .map((toolCall) => ({
                id: toolCall.id,
                name: toolCall.function.name,
                input: JSON.parse(toolCall.function.arguments || "{}"),
            }));
            return {
                ...(message?.content ? { text: message.content } : {}),
                toolCalls,
                stopReason: choice?.finish_reason === "tool_calls" ? "tool_use" :
                    choice?.finish_reason === "length" ? "max_tokens" : "end",
            };
        }
        catch (error) {
            const detail = error instanceof Error ? error.message : String(error);
            throw new UpstreamServiceError("openai", `Failed to get a response from OpenAI: ${detail}`, error);
        }
    }
}
function toOpenAiTool(tool) {
    return {
        type: "function",
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
        },
    };
}
function toOpenAiMessages(message) {
    if (message.role === "user" && message.toolResults) {
        return message.toolResults.map((result) => ({
            role: "tool",
            tool_call_id: result.id,
            content: JSON.stringify(result.output),
        }));
    }
    if (message.role === "assistant") {
        return [{
                role: "assistant",
                content: message.text ?? null,
                ...(message.toolCalls && message.toolCalls.length > 0
                    ? {
                        tool_calls: message.toolCalls.map((toolCall) => ({
                            id: toolCall.id,
                            type: "function",
                            function: { name: toolCall.name, arguments: JSON.stringify(toolCall.input) },
                        })),
                    }
                    : {}),
            }];
    }
    return [{ role: "user", content: message.text ?? "" }];
}
//# sourceMappingURL=openaiProvider.js.map