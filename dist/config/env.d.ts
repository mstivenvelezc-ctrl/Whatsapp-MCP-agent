import { z } from "zod";
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    ANTHROPIC_API_KEY: z.ZodString;
    ANTHROPIC_MODEL: z.ZodDefault<z.ZodString>;
    INTERNAL_AGENT_SECRET: z.ZodString;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    ANTHROPIC_API_KEY: string;
    ANTHROPIC_MODEL: string;
    INTERNAL_AGENT_SECRET: string;
}, {
    ANTHROPIC_API_KEY: string;
    INTERNAL_AGENT_SECRET: string;
    NODE_ENV?: "development" | "test" | "production" | undefined;
    PORT?: number | undefined;
    ANTHROPIC_MODEL?: string | undefined;
}>;
export type Env = z.infer<typeof envSchema>;
export declare function loadEnv(source?: NodeJS.ProcessEnv): Env;
export declare function resetEnvCacheForTests(): void;
export {};
//# sourceMappingURL=env.d.ts.map