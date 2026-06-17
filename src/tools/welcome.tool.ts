import { z } from "zod";
import { defineTool } from "./types.js";

const inputSchema = z.object({});

export const welcomeTool = defineTool({
    name: "show_welcome_menu",
    description:
        "Muestra el menú de bienvenida con los servicios disponibles para el usuario: agendar una cita o " +
        "hablar con un asesor humano. Debe usarse al iniciar la conversación o cuando el usuario pida ver " +
        "las opciones disponibles de nuevo.",
    inputSchema,
    async execute(_input, { session }) {
        session.stage = "menu";
        return {
            greeting: session.contactName ? `Hola ${session.contactName}` : "Hola",
            services: [
                { id: "agendar_cita", label: "Agendar una cita" },
                { id: "hablar_con_asesor", label: "Hablar con un asesor" },
            ],
        };
    },
});
