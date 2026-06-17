import "dotenv/config";
import { loadEnv } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { createAnthropicClient } from "../agent/anthropicClient.js";
import { SessionStore } from "../agent/session.js";
import { createApp } from "./app.js";

function main(): void {
    const env = loadEnv();

    const anthropic = createAnthropicClient(env.ANTHROPIC_API_KEY);
    const sessionStore = new SessionStore();

    const app = createApp({
        sessionStore,
        anthropic,
        model: env.ANTHROPIC_MODEL,
        internalAgentSecret: env.INTERNAL_AGENT_SECRET,
    });

    app.listen(env.PORT, () => {
        logger.info(`Server listening on port ${env.PORT}`);
    });
}

main();
