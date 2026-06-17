import { z } from "zod";
import { defineTool } from "./types.js";
import { ToolExecutionError } from "./errors.js";

const inputSchema = z.object({
    fullName: z.string().min(1, "fullName no puede estar vacío"),
});

export const findOrCreateContactTool = defineTool({
    name: "find_or_create_contact",
    description:
        "Busca en el CRM el contacto asociado al teléfono de WhatsApp del usuario; si no existe, lo crea " +
        "con el nombre indicado. Úsala antes de agendar una cita para asegurar que el contacto exista en el CRM.",
    inputSchema,
    async execute(input, { session, crmClient }) {
        try {
            const existing = await crmClient.findContactByPhone(session.phone);
            if (existing) return { contact: existing, created: false };

            const created = await crmClient.createContact({ phone: session.phone, fullName: input.fullName });
            return { contact: created, created: true };
        } catch (error) {
            throw new ToolExecutionError("find_or_create_contact", "No se pudo consultar/crear el contacto en el CRM", error);
        }
    },
});
