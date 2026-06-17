import express, {} from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { healthRouter } from "./routes/health.route.js";
import { whatsappWebhookRouter } from "./routes/whatsappWebhook.route.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
const webhookRateLimiter = rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
});
export function createApp(deps) {
    const app = express();
    app.disable("x-powered-by");
    app.use(helmet());
    app.use(express.json({
        verify: (req, _res, buf) => {
            req.rawBody = buf;
        },
    }));
    app.use("/health", healthRouter());
    app.use("/webhooks/whatsapp", webhookRateLimiter, whatsappWebhookRouter({
        agent: deps.agent,
        sessionStore: deps.sessionStore,
        whatsappClient: deps.whatsappClient,
        verifyToken: deps.whatsappVerifyToken,
        appSecret: deps.whatsappAppSecret,
    }));
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map