import { z } from "zod";
export declare const selectServiceTool: import("./types.js").Tool<z.ZodObject<{
    service: z.ZodEnum<["agendar_cita", "hablar_con_asesor"]>;
}, "strip", z.ZodTypeAny, {
    service: "agendar_cita" | "hablar_con_asesor";
}, {
    service: "agendar_cita" | "hablar_con_asesor";
}>>;
//# sourceMappingURL=selectService.tool.d.ts.map