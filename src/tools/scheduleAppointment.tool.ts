import { z } from "zod";
import { defineTool } from "./types.js";
import { ToolExecutionError, ToolValidationError } from "./errors.js";

const inputSchema = z.object({
    fullName: z.string().min(1, "fullName no puede estar vacío"),
    appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "appointmentDate debe tener formato YYYY-MM-DD"),
    appointmentTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "appointmentTime debe tener formato HH:mm"),
    department: z.string().min(1).optional(),
    notes: z.string().optional(),
});

export const scheduleAppointmentTool = defineTool({
    name: "schedule_appointment",
    description:
        "Agenda una cita en el CRM para el usuario actual en la fecha y hora elegidas. Usa primero " +
        "list_available_dates y list_available_slots para confirmar una fecha/hora válida antes de llamar a esta herramienta.",
    inputSchema,
    async execute(input, { session, crmClient }) {
        const startsAt = new Date(`${input.appointmentDate}T${input.appointmentTime}:00`);
        if (startsAt.getTime() <= Date.now()) {
            throw new ToolValidationError("schedule_appointment", "La fecha de la cita debe ser futura");
        }

        try {
            const appointment = await crmClient.createAppointment({
                clientPhone: session.phone,
                clientName: input.fullName,
                appointmentDate: input.appointmentDate,
                appointmentTime: input.appointmentTime,
                ...(input.department !== undefined ? { department: input.department } : {}),
                ...(input.notes !== undefined ? { notes: input.notes } : {}),
            });
            session.stage = "closed";
            return { appointment };
        } catch (error) {
            throw new ToolExecutionError("schedule_appointment", "No se pudo agendar la cita en el CRM", error);
        }
    },
});
