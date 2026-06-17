import { z } from "zod";
import { defineTool } from "./types.js";
import { ToolExecutionError } from "./errors.js";
const inputSchema = z.object({});
export const listProductsTool = defineTool({
    name: "list_products",
    description: "Consulta en el CRM el catálogo de productos/servicios activos, con su precio y descripción.",
    inputSchema,
    async execute(_input, { crmClient }) {
        try {
            const products = await crmClient.listActiveProducts();
            return { products };
        }
        catch (error) {
            throw new ToolExecutionError("list_products", "No se pudo consultar el catálogo de productos", error);
        }
    },
});
//# sourceMappingURL=listProducts.tool.js.map