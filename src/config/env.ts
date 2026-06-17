import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),

    ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
    ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-6"),

    WHATSAPP_ACCESS_TOKEN: z.string().min(1, "WHATSAPP_ACCESS_TOKEN is required"),
    WHATSAPP_PHONE_NUMBER_ID: z.string().min(1, "WHATSAPP_PHONE_NUMBER_ID is required"),
    WHATSAPP_VERIFY_TOKEN: z.string().min(1, "WHATSAPP_VERIFY_TOKEN is required"),
    WHATSAPP_APP_SECRET: z.string().min(1, "WHATSAPP_APP_SECRET is required"),
    WHATSAPP_API_VERSION: z.string().default("v21.0"),

    CRM_BASE_URL: z.string().url("CRM_BASE_URL must be a valid URL"),
    CRM_API_KEY: z.string().min(1, "CRM_API_KEY is required"),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | undefined;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
    if (cachedEnv) return cachedEnv;

    const parsed = envSchema.safeParse(source);
    if (!parsed.success) {
        const details = parsed.error.issues
            .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
            .join("\n");
        throw new Error(`Invalid environment configuration:\n${details}`);
    }

    cachedEnv = parsed.data;
    return cachedEnv;
}

export function resetEnvCacheForTests(): void {
    cachedEnv = undefined;
}
