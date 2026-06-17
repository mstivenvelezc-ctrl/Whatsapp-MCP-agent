import { z } from "zod";
export declare const scheduleAppointmentTool: import("./types.js").Tool<z.ZodObject<{
    fullName: z.ZodString;
    appointmentDate: z.ZodString;
    appointmentTime: z.ZodString;
    department: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    appointmentDate: string;
    appointmentTime: string;
    department?: string | undefined;
    notes?: string | undefined;
}, {
    fullName: string;
    appointmentDate: string;
    appointmentTime: string;
    department?: string | undefined;
    notes?: string | undefined;
}>>;
//# sourceMappingURL=scheduleAppointment.tool.d.ts.map