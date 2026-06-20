import { z } from "zod";
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-6"),
    OPENAI_MODEL: z.string().default("gpt-4o"),
    GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
    INTERNAL_AGENT_SECRET: z.string().min(1, "INTERNAL_AGENT_SECRET is required"),
});
let cachedEnv;
export function loadEnv(source = process.env) {
    if (cachedEnv)
        return cachedEnv;
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
export function resetEnvCacheForTests() {
    cachedEnv = undefined;
}
//# sourceMappingURL=env.js.map