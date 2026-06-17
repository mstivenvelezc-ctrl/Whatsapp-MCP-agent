import { z } from "zod";
import { defineTool } from "./types.js";
import { ToolExecutionError } from "./errors.js";

const inputSchema = z.object({});

export const listAvailableDatesTool = defineTool({
    name: "list_available_dates",
    description: "Consulta en el CRM las próximas fechas con disponibilidad para agendar una cita.",
    inputSchema,
    async execute(_input, { crmClient }) {
        try {
            const dates = await crmClient.getAvailableDates();
            return { dates };
        } catch (error) {
            throw new ToolExecutionError(
                "list_available_dates",
                "No se pudieron consultar las fechas disponibles en el CRM",
                error,
            );
        }
    },
});
