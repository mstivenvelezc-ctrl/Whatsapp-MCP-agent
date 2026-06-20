import Anthropic from "@anthropic-ai/sdk";
import type { Fetch } from "@anthropic-ai/sdk/core";
import { UpstreamServiceError } from "../lib/errors.js";
import type { LlmClient, LlmMessage, LlmResponse, LlmTool, LlmToolCall } from "./types.js";

const MAX_TOKENS = 1024;

// Algunos entornos (p.ej. Fly.io) reusan conexiones HTTP keep-alive que el servidor remoto ya
// cerró, lo que produce errores intermitentes "Premature close" en el fetch nativo de Node.
// Forzar Connection: close evita reusar sockets potencialmente muertos, a costa de una conexión
// TCP/TLS nueva por request.
const fetchWithoutKeepAlive: Fetch = async (url, init) => {
    const headers = { ...(init?.headers as Record<string, string> | undefined), Connection: "close" };
    return fetch(url as string, { ...init, headers, keepalive: false } as RequestInit) as unknown as ReturnType<Fetch>;
};

export class AnthropicProvider implements LlmClient {
    private readonly client: Anthropic;

    constructor(apiKey: string, private readonly model: string) {
        this.client = new Anthropic({ apiKey, fetch: fetchWithoutKeepAlive });
    }

    async createMessage(systemPrompt: string, history: LlmMessage[], tools: LlmTool[]): Promise<LlmResponse> {
        try {
            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: MAX_TOKENS,
                system: systemPrompt,
                tools: tools.map((tool) => ({
                    name: tool.name,
                    description: tool.description,
                    input_schema: tool.inputSchema as Anthropic.Tool.InputSchema,
                })),
                messages: history.map(toAnthropicMessage),
            });

            const toolCalls: LlmToolCall[] = response.content
                .filter((block): block is Anthropic.ToolUseBlock => block.type === "tool_use")
                .map((block) => ({ id: block.id, name: block.name, input: block.input }));

            const text = response.content
                .filter((block): block is Anthropic.TextBlock => block.type === "text")
                .map((block) => block.text)
                .join("\n")
                .trim();

            return {
                ...(text ? { text } : {}),
                toolCalls,
                stopReason: response.stop_reason === "tool_use" ? "tool_use" :
                    response.stop_reason === "max_tokens" ? "max_tokens" : "end",
            };
        } catch (error) {
            const detail = error instanceof Error ? error.message : String(error);
            throw new UpstreamServiceError("anthropic", `Failed to get a response from Anthropic: ${detail}`, error);
        }
    }
}

function toAnthropicMessage(message: LlmMessage): Anthropic.MessageParam {
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
        const content: Array<Anthropic.TextBlockParam | Anthropic.ToolUseBlockParam> = [];
        if (message.text) content.push({ type: "text", text: message.text });
        for (const toolCall of message.toolCalls ?? []) {
            content.push({ type: "tool_use", id: toolCall.id, name: toolCall.name, input: toolCall.input });
        }
        return { role: "assistant", content };
    }

    return { role: "user", content: message.text ?? "" };
}
