import type { ToolContext } from "./types.js";
import type { LlmTool } from "../llm/types.js";
export declare function getToolDefinitions(): LlmTool[];
export interface ToolDispatchResult {
    output: unknown;
    isError: boolean;
}
export declare function dispatchTool(toolName: string, rawInput: unknown, context: ToolContext): Promise<ToolDispatchResult>;
//# sourceMappingURL=registry.d.ts.map