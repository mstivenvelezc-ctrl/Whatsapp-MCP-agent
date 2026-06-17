import express, { type Express } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { Agent } from "../agent/agent.js";
import type { SessionStore } from "../agent/session.js";
import type { WhatsappClient } from "../whatsapp/client.js";
import type { CrmClient } from "../crm/types.js";
import { healthRouter } from "./routes/health.route.js";
import { whatsappWebhookRouter } from "./routes/whatsappWebhook.route.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export interface AppDeps {
    agent: Agent;
    sessionStore: SessionStore;
    whatsappClient: WhatsappClient;
    crmClient: CrmClient;
    whatsappVerifyToken: string;
    whatsappAppSecret: string;
}

const webhookRateLimiter = rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
});

export function createApp(deps: AppDeps): Express {
    const app = express();

    app.disable("x-powered-by");
    app.use(helmet());
    app.use(
        express.json({
            verify: (req, _res, buf) => {
                (req as express.Request).rawBody = buf;
            },
        }),
    );

    app.use("/health", healthRouter());
    app.use(
        "/webhooks/whatsapp",
        webhookRateLimiter,
        whatsappWebhookRouter({
            agent: deps.agent,
            sessionStore: deps.sessionStore,
            whatsappClient: deps.whatsappClient,
            crmClient: deps.crmClient,
            verifyToken: deps.whatsappVerifyToken,
            appSecret: deps.whatsappAppSecret,
        }),
    );

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
