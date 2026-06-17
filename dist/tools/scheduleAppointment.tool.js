import { z } from "zod";
import { defineTool } from "./types.js";
import { ToolExecutionError, ToolValidationError } from "./errors.js";
const inputSchema = z.object({
    fullName: z.string().min(1, "fullName no puede estar vacío"),
    startsAt: z.string().datetime({ message: "startsAt debe ser una fecha ISO 8601 válida" }),
    reason: z.string().min(1, "reason no puede estar vacío"),
});
export const scheduleAppointmentTool = defineTool({
    name: "schedule_appointment",
    description: "Agenda una cita en el CRM para el usuario actual en la fecha/hora indicada (ISO 8601) y con el " +
        "motivo de la cita. Llama a find_or_create_contact antes si aún no se conoce el nombre del contacto.",
    inputSchema,
    async execute(input, { session, crmClient }) {
        const startsAt = new Date(input.startsAt);
        if (startsAt.getTime() <= Date.now()) {
            throw new ToolValidationError("schedule_appointment", "La fecha de la cita debe ser futura");
        }
        try {
            const appointment = await crmClient.createAppointment({
                contact: { phone: session.phone, fullName: input.fullName },
                startsAt: startsAt.toISOString(),
                reason: input.reason,
            });
            session.stage = "closed";
            return { appointment };
        }
        catch (error) {
            throw new ToolExecutionError("schedule_appointment", "No se pudo agendar la cita en el CRM", error);
        }
    },
});
//# sourceMappingURL=scheduleAppointment.tool.js.map