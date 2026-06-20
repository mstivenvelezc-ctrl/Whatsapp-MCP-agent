import type { LlmClient, LlmProviderName } from "./types.js";
export interface LlmModels {
    anthropic: string;
    openai: string;
    gemini: string;
}
export declare function createLlmClient(provider: LlmProviderName, apiKey: string, models: LlmModels): LlmClient;
//# sourceMappingURL=factory.d.ts.map