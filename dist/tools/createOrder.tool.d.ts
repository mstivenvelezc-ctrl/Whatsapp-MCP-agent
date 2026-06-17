import { z } from "zod";
export declare const createOrderTool: import("./types.js").Tool<z.ZodObject<{
    type: z.ZodEnum<["PEDIDO", "COTIZACION"]>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodNumber;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: number;
        quantity: number;
    }, {
        productId: number;
        quantity: number;
    }>, "many">;
    fullName: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "PEDIDO" | "COTIZACION";
    items: {
        productId: number;
        quantity: number;
    }[];
    fullName?: string | undefined;
    notes?: string | undefined;
}, {
    type: "PEDIDO" | "COTIZACION";
    items: {
        productId: number;
        quantity: number;
    }[];
    fullName?: string | undefined;
    notes?: string | undefined;
}>>;
//# sourceMappingURL=createOrder.tool.d.ts.map