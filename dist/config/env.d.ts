import { z } from "zod";
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    ANTHROPIC_API_KEY: z.ZodString;
    ANTHROPIC_MODEL: z.ZodDefault<z.ZodString>;
    WHATSAPP_ACCESS_TOKEN: z.ZodString;
    WHATSAPP_PHONE_NUMBER_ID: z.ZodString;
    WHATSAPP_VERIFY_TOKEN: z.ZodString;
    WHATSAPP_APP_SECRET: z.ZodString;
    WHATSAPP_API_VERSION: z.ZodDefault<z.ZodString>;
    CRM_BASE_URL: z.ZodString;
    CRM_API_KEY: z.ZodString;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    ANTHROPIC_API_KEY: string;
    ANTHROPIC_MODEL: string;
    WHATSAPP_ACCESS_TOKEN: string;
    WHATSAPP_PHONE_NUMBER_ID: string;
    WHATSAPP_VERIFY_TOKEN: string;
    WHATSAPP_APP_SECRET: string;
    WHATSAPP_API_VERSION: string;
    CRM_BASE_URL: string;
    CRM_API_KEY: string;
}, {
    ANTHROPIC_API_KEY: string;
    WHATSAPP_ACCESS_TOKEN: string;
    WHATSAPP_PHONE_NUMBER_ID: string;
    WHATSAPP_VERIFY_TOKEN: string;
    WHATSAPP_APP_SECRET: string;
    CRM_BASE_URL: string;
    CRM_API_KEY: string;
    NODE_ENV?: "development" | "test" | "production" | undefined;
    PORT?: number | undefined;
    ANTHROPIC_MODEL?: string | undefined;
    WHATSAPP_API_VERSION?: string | undefined;
}>;
export type Env = z.infer<typeof envSchema>;
export declare function loadEnv(source?: NodeJS.ProcessEnv): Env;
export declare function resetEnvCacheForTests(): void;
export {};
//# sourceMappingURL=env.d.ts.map