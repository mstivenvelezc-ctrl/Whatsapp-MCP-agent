import { AnthropicProvider } from "./anthropicProvider.js";
import { OpenAiProvider } from "./openaiProvider.js";
import { GeminiProvider } from "./geminiProvider.js";
export function createLlmClient(provider, apiKey, models) {
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
//# sourceMappingURL=factory.js.map