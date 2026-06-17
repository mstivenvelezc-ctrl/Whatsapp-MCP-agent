import { z } from "zod";
import { defineTool } from "./types.js";
import { ToolExecutionError } from "./errors.js";

const inputSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date debe tener formato YYYY-MM-DD"),
});

export const listAvailableSlotsTool = defineTool({
    name: "list_available_slots",
    description: "Consulta en el CRM los horarios disponibles para una fecha específica (formato YYYY-MM-DD).",
    inputSchema,
    async execute(input, { crmClient }) {
        try {
            const slots = await crmClient.getAvailableSlots(input.date);
            return { slots };
        } catch (error) {
            throw new ToolExecutionError(
                "list_available_slots",
                "No se pudieron consultar los horarios disponibles en el CRM",
                error,
            );
        }
    },
});
