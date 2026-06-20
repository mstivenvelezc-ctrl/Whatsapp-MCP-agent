import "dotenv/config";
import { loadEnv } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { SessionStore } from "../agent/session.js";
import { createApp } from "./app.js";
function main() {
    const env = loadEnv();
    const sessionStore = new SessionStore();
    const app = createApp({
        sessionStore,
        models: { anthropic: env.ANTHROPIC_MODEL, openai: env.OPENAI_MODEL, gemini: env.GEMINI_MODEL },
        internalAgentSecret: env.INTERNAL_AGENT_SECRET,
    });
    app.listen(env.PORT, () => {
        logger.info(`Server listening on port ${env.PORT}`);
    });
}
main();
//# sourceMappingURL=index.js.map