import { GoogleGenAI } from "@google/genai";
import { UpstreamServiceError } from "../lib/errors.js";
export class GeminiProvider {
    model;
    client;
    constructor(apiKey, model) {
        this.model = model;
        this.client = new GoogleGenAI({ apiKey });
    }
    async createMessage(systemPrompt, history, tools) {
        try {
            const response = await this.client.models.generateContent({
                model: this.model,
                contents: history.map(toGeminiContent),
                config: {
                    systemInstruction: systemPrompt,
                    ...(tools.length > 0
                        ? { tools: [{ functionDeclarations: tools.map(toGeminiFunctionDeclaration) }] }
                        : {}),
                },
            });
            const parts = (response.candidates?.[0]?.content?.parts ?? []);
            const toolCalls = parts
                .filter((part) => !!part.functionCall)
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
        }
        catch (error) {
            const detail = error instanceof Error ? error.message : String(error);
            throw new UpstreamServiceError("gemini", `Failed to get a response from Gemini: ${detail}`, error);
        }
    }
}
function toGeminiFunctionDeclaration(tool) {
    return {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
    };
}
function toGeminiContent(message) {
    if (message.role === "user" && message.toolResults) {
        return {
            role: "user",
            parts: message.toolResults.map((result) => ({
                functionResponse: { name: result.name, response: { result: result.output } },
            })),
        };
    }
    if (message.role === "assistant") {
        const parts = [];
        if (message.text)
            parts.push({ text: message.text });
        for (const toolCall of message.toolCalls ?? []) {
            parts.push({ functionCall: { name: toolCall.name, args: toolCall.input } });
        }
        return { role: "model", parts };
    }
    return { role: "user", parts: [{ text: message.text ?? "" }] };
}
//# sourceMappingURL=geminiProvider.js.map