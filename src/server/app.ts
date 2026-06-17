import express, { type Express } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type Anthropic from "@anthropic-ai/sdk";
import type { SessionStore } from "../agent/session.js";
import { healthRouter } from "./routes/health.route.js";
import { internalAgentRouter } from "./routes/internalAgent.route.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export interface AppDeps {
    sessionStore: SessionStore;
    anthropic: Anthropic;
    model: string;
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
            anthropic: deps.anthropic,
            model: deps.model,
            sessionStore: deps.sessionStore,
            internalAgentSecret: deps.internalAgentSecret,
        }),
    );

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
