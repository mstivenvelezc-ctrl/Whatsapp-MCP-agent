import type { LlmClient, LlmMessage, LlmResponse, LlmTool } from "./types.js";
export declare class OpenAiProvider implements LlmClient {
    private readonly model;
    private readonly client;
    constructor(apiKey: string, model: string);
    createMessage(systemPrompt: string, history: LlmMessage[], tools: LlmTool[]): Promise<LlmResponse>;
}
//# sourceMappingURL=openaiProvider.d.ts.map