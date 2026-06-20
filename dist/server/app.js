import express, {} from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { healthRouter } from "./routes/health.route.js";
import { internalAgentRouter } from "./routes/internalAgent.route.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
const internalRateLimiter = rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
});
export function createApp(deps) {
    const app = express();
    app.disable("x-powered-by");
    app.use(helmet());
    app.use(express.json());
    app.use("/health", healthRouter());
    app.use("/internal", internalRateLimiter, internalAgentRouter({
        models: deps.models,
        sessionStore: deps.sessionStore,
        internalAgentSecret: deps.internalAgentSecret,
    }));
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map