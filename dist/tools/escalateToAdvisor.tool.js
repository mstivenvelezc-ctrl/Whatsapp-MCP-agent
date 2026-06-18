import { z } from "zod";
import { defineTool } from "./types.js";
import { ToolExecutionError } from "./errors.js";
const inputSchema = z.object({
    reason: z.string().min(1, "reason no puede estar vacío"),
});
export const escalateToAdvisorTool = defineTool({
    name: "escalate_to_advisor",
    description: "Pasa la conversación a un asesor humano del departamento correcto según la problemática del usuario, " +
        "y detiene las respuestas automáticas del bot para este usuario. Úsala cuando el usuario pida hablar " +
        "con una persona o cuando la solicitud no pueda resolverse con las herramientas disponibles.",
    inputSchema,
    async execute(input, { session, crmClient }) {
        let result;
        try {
            result = await crmClient.escalateToAgent({
                clientPhone: session.phone,
                requestText: input.reason,
                ...(session.contactName !== undefined ? { clientName: session.contactName } : {}),
            });
        }
        catch (error) {
            throw new ToolExecutionError("escalate_to_advisor", "No se pudo escalar la conversación a un asesor", error);
        }
        session.stage = "handed_off_to_advisor";
        return {
            handedOff: true,
            department: result.department,
            ...(result.agentName !== undefined ? { agentName: result.agentName } : {}),
        };
    },
});
//# sourceMappingURL=escalateToAdvisor.tool.js.map