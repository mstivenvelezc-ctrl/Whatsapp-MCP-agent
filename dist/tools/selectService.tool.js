import { z } from "zod";
import { defineTool } from "./types.js";
const inputSchema = z.object({
    service: z.enum(["agendar_cita", "hablar_con_asesor"], {
        message: "service debe ser 'agendar_cita' o 'hablar_con_asesor'",
    }),
});
export const selectServiceTool = defineTool({
    name: "select_service",
    description: "Registra el servicio que el usuario eligió del menú de bienvenida: 'agendar_cita' para iniciar el " +
        "flujo de agendamiento, o 'hablar_con_asesor' para escalar la conversación a un asesor humano.",
    inputSchema,
    async execute(input, { session }) {
        session.stage = input.service === "agendar_cita" ? "scheduling_appointment" : "menu";
        return { acknowledged: true, service: input.service };
    },
});
//# sourceMappingURL=selectService.tool.js.map