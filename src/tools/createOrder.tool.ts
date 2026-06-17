import { z } from "zod";
import { defineTool } from "./types.js";
import { ToolExecutionError } from "./errors.js";

const inputSchema = z.object({
    type: z.enum(["PEDIDO", "COTIZACION"]),
    items: z
        .array(
            z.object({
                productId: z.number().int().positive(),
                quantity: z.number().int().positive(),
            }),
        )
        .min(1, "items no puede estar vacío"),
    fullName: z.string().min(1).optional(),
    notes: z.string().optional(),
});

export const createOrderTool = defineTool({
    name: "create_order",
    description:
        "Crea un pedido o cotización en el CRM con los productos elegidos por el usuario. Usa list_products " +
        "primero para conocer los productId disponibles; el precio siempre se toma del catálogo del CRM, no lo inventes.",
    inputSchema,
    async execute(input, { session, crmClient }) {
        try {
            const order = await crmClient.createOrder({
                clientPhone: session.phone,
                type: input.type,
                items: input.items,
                ...(input.fullName !== undefined ? { clientName: input.fullName } : {}),
                ...(input.notes !== undefined ? { notes: input.notes } : {}),
            });
            return { order };
        } catch (error) {
            throw new ToolExecutionError("create_order", "No se pudo crear el pedido en el CRM", error);
        }
    },
});
