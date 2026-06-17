import type Anthropic from "@anthropic-ai/sdk";
import type { ToolContext } from "./types.js";
export declare function getToolDefinitions(): Anthropic.Tool[];
export interface ToolDispatchResult {
    output: unknown;
    isError: boolean;
}
export declare function dispatchTool(toolName: string, rawInput: unknown, context: ToolContext): Promise<ToolDispatchResult>;
//# sourceMappingURL=registry.d.ts.map