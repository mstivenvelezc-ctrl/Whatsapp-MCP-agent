import { GoogleGenAI } from "@google/genai";
import { UpstreamServiceError } from "../lib/errors.js";
import type { LlmClient, LlmMessage, LlmResponse, LlmTool, LlmToolCall } from "./types.js";

interface GeminiPart {
    text?: string;
    functionCall?: { id?: string; name: string; args?: Record<string, unknown> };
    functionResponse?: { name: string; response: Record<string, unknown> };
}

interface GeminiContent {
    role: "user" | "model";
    parts: GeminiPart[];
}

export class GeminiProvider implements LlmClient {
    private readonly client: GoogleGenAI;

    constructor(apiKey: string, private readonly model: string) {
        this.client = new GoogleGenAI({ apiKey });
    }

    async createMessage(systemPrompt: string, history: LlmMessage[], tools: LlmTool[]): Promise<LlmResponse> {
        try {
            const response = await this.client.models.generateContent({
                model: this.model,
                contents: history.map(toGeminiContent) as never,
                config: {
                    systemInstruction: systemPrompt,
                    ...(tools.length > 0
                        ? { tools: [{ functionDeclarations: tools.map(toGeminiFunctionDeclaration) }] as never }
                        : {}),
                },
            });

            const parts = (response.candidates?.[0]?.content?.parts ?? []) as GeminiPart[];

            const toolCalls: LlmToolCall[] = parts
                .filter((part): part is GeminiPart & { functionCall: NonNullable<GeminiPart["functionCall"]> } =>
                    !!part.functionCall)
                .map((part, index) => ({
                    id: part.functionCall.id ?? `${part.functionCall.name}_${index}`,
                    name: part.functionCall.name,
                    input: part.functionCall.args ?? {},
                }));

            const text = parts.map((part) => part.text ?? "").join("").trim();

            return {
                ...(text ? { text } : {}),
                toolCalls,
                stopReason: toolCalls.length > 0 ? "tool_use" :
                    response.candidates?.[0]?.finishReason === "MAX_TOKENS" ? "max_tokens" : "end",
            };
        } catch (error) {
            const detail = error instanceof Error ? error.message : String(error);
            throw new UpstreamServiceError("gemini", `Failed to get a response from Gemini: ${detail}`, error);
        }
    }
}

function toGeminiFunctionDeclaration(tool: LlmTool) {
    return {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema as Record<string, unknown>,
    };
}

function toGeminiContent(message: LlmMessage): GeminiContent {
    if (message.role === "user" && message.toolResults) {
        return {
            role: "user",
            parts: message.toolResults.map((result) => ({
                functionResponse: { name: result.name, response: { result: result.output as Record<string, unknown> } },
            })),
        };
    }

    if (message.role === "assistant") {
        const parts: GeminiPart[] = [];
        if (message.text) parts.push({ text: message.text });
        for (const toolCall of message.toolCalls ?? []) {
            parts.push({ functionCall: { name: toolCall.name, args: toolCall.input as Record<string, unknown> } });
        }
        return { role: "model", parts };
    }

    return { role: "user", parts: [{ text: message.text ?? "" }] };
}
