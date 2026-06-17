import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),

    ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
    ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-6"),

    INTERNAL_AGENT_SECRET: z.string().min(1, "INTERNAL_AGENT_SECRET is required"),
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
