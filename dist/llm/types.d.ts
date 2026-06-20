export interface LlmTool {
    name: string;
    description: string;
    inputSchema: object;
}
export interface LlmToolCall {
    id: string;
    name: string;
    input: unknown;
}
export interface LlmToolResult {
    id: string;
    name: string;
    output: unknown;
    isError: boolean;
}
export interface LlmMessage {
    role: "user" | "assistant";
    text?: string;
    toolCalls?: LlmToolCall[];
    toolResults?: LlmToolResult[];
}
export interface LlmResponse {
    text?: string;
    toolCalls: LlmToolCall[];
    stopReason: "tool_use" | "end" | "max_tokens";
}
export interface LlmClient {
    createMessage(systemPrompt: string, history: LlmMessage[], tools: LlmTool[]): Promise<LlmResponse>;
}
export type LlmProviderName = "CLAUDE" | "OPENAI" | "GEMINI";
//# sourceMappingURL=types.d.ts.map