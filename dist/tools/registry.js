import { zodToJsonSchema } from "zod-to-json-schema";
import { ToolExecutionError, ToolValidationError } from "./errors.js";
import { logger } from "../lib/logger.js";
import { welcomeTool } from "./welcome.tool.js";
import { selectServiceTool } from "./selectService.tool.js";
import { listAvailableDatesTool } from "./listAvailableDates.tool.js";
import { listAvailableSlotsTool } from "./listAvailableSlots.tool.js";
import { scheduleAppointmentTool } from "./scheduleAppointment.tool.js";
import { listProductsTool } from "./listProducts.tool.js";
import { createOrderTool } from "./createOrder.tool.js";
import { escalateToAdvisorTool } from "./escalateToAdvisor.tool.js";
const tools = [
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
export function getToolDefinitions() {
    return tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: zodToJsonSchema(tool.inputSchema, { target: "jsonSchema7" }),
    }));
}
export async function dispatchTool(toolName, rawInput, context) {
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
    }
    catch (error) {
        if (error instanceof ToolExecutionError) {
            const causeDetail = error.cause instanceof Error ? error.cause.message : String(error.cause ?? "");
            logger.error(`Tool ${toolName} execution failed`, { message: error.message, cause: causeDetail });
            return { output: { error: error.message }, isError: true };
        }
        if (error instanceof ToolValidationError) {
            return { output: { error: error.message }, isError: true };
        }
        logger.error(`Tool ${toolName} threw an unexpected error`, {
            error: error instanceof Error ? error.message : String(error),
        });
        return {
            output: { error: `Error inesperado ejecutando ${toolName}` },
            isError: true,
        };
    }
}
//# sourceMappingURL=registry.js.map