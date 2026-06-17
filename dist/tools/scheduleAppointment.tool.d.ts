import { z } from "zod";
export declare const scheduleAppointmentTool: import("./types.js").Tool<z.ZodObject<{
    fullName: z.ZodString;
    startsAt: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    startsAt: string;
    reason: string;
}, {
    fullName: string;
    startsAt: string;
    reason: string;
}>>;
//# sourceMappingURL=scheduleAppointment.tool.d.ts.map