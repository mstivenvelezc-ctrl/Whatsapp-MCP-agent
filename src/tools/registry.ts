import type Anthropic from "@anthropic-ai/sdk";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { Tool, ToolContext } from "./types.js";
import { ToolExecutionError, ToolValidationError } from "./errors.js";
import { welcomeTool } from "./welcome.tool.js";
import { selectServiceTool } from "./selectService.tool.js";
import { listAvailableDatesTool } from "./listAvailableDates.tool.js";
import { listAvailableSlotsTool } from "./listAvailableSlots.tool.js";
import { scheduleAppointmentTool } from "./scheduleAppointment.tool.js";
import { listProductsTool } from "./listProducts.tool.js";
import { createOrderTool } from "./createOrder.tool.js";
import { escalateToAdvisorTool } from "./escalateToAdvisor.tool.js";

const tools: Tool[] = [
    welcomeTool,
    selectServiceTool,
    listAvailableDatesTool,
    listAvailableSlotsTool,
    scheduleAppointmentTool,
    listProductsTool,
    createOrderTool,
    escalateToAdvisorTool,
];

const toolsByName = new Map(tools.map((tool) => [tool.name, tool]));

export function getToolDefinitions(): Anthropic.Tool[] {
    return tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: zodToJsonSchema(tool.inputSchema, { target: "jsonSchema7" }) as Anthropic.Tool.InputSchema,
    }));
}

export interface ToolDispatchResult {
    output: unknown;
    isError: boolean;
}

export async function dispatchTool(
    toolName: string,
    rawInput: unknown,
    context: ToolContext,
): Promise<ToolDispatchResult> {
    const tool = toolsByName.get(toolName);
    if (!tool) {
        return { output: { error: `Herramienta desconocida: ${toolName}` }, isError: true };
    }

    const parsed = tool.inputSchema.safeParse(rawInput ?? {});
    if (!parsed.success) {
        return {
            output: { error: `Entrada inválida para ${toolName}: ${parsed.error.message}` },
            isError: true,
        };
    }

    try {
        const output = await tool.execute(parsed.data, context);
        return { output, isError: false };
    } catch (error) {
        if (error instanceof ToolValidationError || error instanceof ToolExecutionError) {
            return { output: { error: error.message }, isError: true };
        }
        return {
            output: { error: `Error inesperado ejecutando ${toolName}` },
            isError: true,
        };
    }
}
