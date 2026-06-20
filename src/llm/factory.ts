import { AnthropicProvider } from "./anthropicProvider.js";
import { OpenAiProvider } from "./openaiProvider.js";
import { GeminiProvider } from "./geminiProvider.js";
import type { LlmClient, LlmProviderName } from "./types.js";

export interface LlmModels {
    anthropic: string;
    openai: string;
    gemini: string;
}

export function createLlmClient(provider: LlmProviderName, apiKey: string, models: LlmModels): LlmClient {
    switch (provider) {
        case "OPENAI":
            return new OpenAiProvider(apiKey, models.openai);
        case "GEMINI":
            return new GeminiProvider(apiKey, models.gemini);
        case "CLAUDE":
        default:
            return new AnthropicProvider(apiKey, models.anthropic);
    }
}
