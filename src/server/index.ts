import "dotenv/config";
import { loadEnv } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { createAnthropicClient } from "../agent/anthropicClient.js";
import { Agent } from "../agent/agent.js";
import { SessionStore } from "../agent/session.js";
import { RestCrmClient } from "../crm/restCrmClient.js";
import { CloudApiWhatsappClient } from "../whatsapp/client.js";
import { createApp } from "./app.js";

function main(): void {
    const env = loadEnv();

    const crmClient = new RestCrmClient({ baseUrl: env.CRM_BASE_URL, apiKey: env.CRM_API_KEY });
    const whatsappClient = new CloudApiWhatsappClient({
        accessToken: env.WHATSAPP_ACCESS_TOKEN,
        phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
        apiVersion: env.WHATSAPP_API_VERSION,
    });
    const anthropic = createAnthropicClient(env.ANTHROPIC_API_KEY);
    const agent = new Agent({ anthropic, model: env.ANTHROPIC_MODEL, crmClient });
    const sessionStore = new SessionStore();

    const app = createApp({
        agent,
        sessionStore,
        whatsappClient,
        crmClient,
        whatsappVerifyToken: env.WHATSAPP_VERIFY_TOKEN,
        whatsappAppSecret: env.WHATSAPP_APP_SECRET,
    });

    app.listen(env.PORT, () => {
        logger.info(`Server listening on port ${env.PORT}`);
    });
}

main();
