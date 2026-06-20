import express, { type Express } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { SessionStore } from "../agent/session.js";
import type { LlmModels } from "../llm/factory.js";
import { healthRouter } from "./routes/health.route.js";
import { internalAgentRouter } from "./routes/internalAgent.route.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export interface AppDeps {
    sessionStore: SessionStore;
    models: LlmModels;
    internalAgentSecret: string;
}

const internalRateLimiter = rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
});

export function createApp(deps: AppDeps): Express {
    const app = express();

    app.disable("x-powered-by");
    app.use(helmet());
    app.use(express.json());

    app.use("/health", healthRouter());
    app.use(
        "/internal",
        internalRateLimiter,
        internalAgentRouter({
            models: deps.models,
            sessionStore: deps.sessionStore,
            internalAgentSecret: deps.internalAgentSecret,
        }),
    );

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
