import { z } from "zod";
import { defineTool } from "./types.js";
const inputSchema = z.object({
    reason: z.string().min(1, "reason no puede estar vacío"),
});
export const escalateToAdvisorTool = defineTool({
    name: "escalate_to_advisor",
    description: "Pasa la conversación a un asesor humano y detiene las respuestas automáticas del bot para este " +
        "usuario. Úsala cuando el usuario pida hablar con una persona o cuando la solicitud no pueda " +
        "resolverse con las herramientas disponibles.",
    inputSchema,
    async execute(input, { session }) {
        session.stage = "handed_off_to_advisor";
        return { handedOff: true, reason: input.reason };
    },
});
//# sourceMappingURL=escalateToAdvisor.tool.js.map