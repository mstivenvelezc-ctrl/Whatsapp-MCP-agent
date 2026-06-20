import Anthropic from "@anthropic-ai/sdk";
import { UpstreamServiceError } from "../lib/errors.js";
const MAX_TOKENS = 1024;
// Algunos entornos (p.ej. Fly.io) reusan conexiones HTTP keep-alive que el servidor remoto ya
// cerró, lo que produce errores intermitentes "Premature close" en el fetch nativo de Node.
// Forzar Connection: close evita reusar sockets potencialmente muertos, a costa de una conexión
// TCP/TLS nueva por request.
const fetchWithoutKeepAlive = async (url, init) => {
    const headers = { ...init?.headers, Connection: "close" };
    return fetch(url, { ...init, headers, keepalive: false });
};
export class AnthropicProvider {
    model;
    client;
    constructor(apiKey, model) {
        this.model = model;
        this.client = new Anthropic({ apiKey, fetch: fetchWithoutKeepAlive });
    }
    async createMessage(systemPrompt, history, tools) {
        try {
            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: MAX_TOKENS,
                system: systemPrompt,
                tools: tools.map((tool) => ({
                    name: tool.name,
                    description: tool.description,
                    input_schema: tool.inputSchema,
                })),
                messages: history.map(toAnthropicMessage),
            });
            const toolCalls = response.content
                .filter((block) => block.type === "tool_use")
                .map((block) => ({ id: block.id, name: block.name, input: block.input }));
            const text = response.content
                .filter((block) => block.type === "text")
                .map((block) => block.text)
                .join("\n")
                .trim();
            return {
                ...(text ? { text } : {}),
                toolCalls,
                stopReason: response.stop_reason === "tool_use" ? "tool_use" :
                    response.stop_reason === "max_tokens" ? "max_tokens" : "end",
            };
        }
        catch (error) {
            const detail = error instanceof Error ? error.message : String(error);
            throw new UpstreamServiceError("anthropic", `Failed to get a response from Anthropic: ${detail}`, error);
        }
    }
}
function toAnthropicMessage(message) {
    if (message.role === "user" && message.toolResults) {
        return {
            role: "user",
            content: message.toolResults.map((result) => ({
                type: "tool_result",
                tool_use_id: result.id,
                content: JSON.stringify(result.output),
                is_error: result.isError,
            })),
        };
    }
    if (message.role === "assistant") {
        const content = [];
        if (message.text)
            content.push({ type: "text", text: message.text });
        for (const toolCall of message.toolCalls ?? []) {
            content.push({ type: "tool_use", id: toolCall.id, name: toolCall.name, input: toolCall.input });
        }
        return { role: "assistant", content };
    }
    return { role: "user", content: message.text ?? "" };
}
//# sourceMappingURL=anthropicProvider.js.map