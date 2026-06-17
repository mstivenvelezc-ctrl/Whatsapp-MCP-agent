import { type Express } from "express";
import type Anthropic from "@anthropic-ai/sdk";
import type { SessionStore } from "../agent/session.js";
export interface AppDeps {
    sessionStore: SessionStore;
    anthropic: Anthropic;
    model: string;
    internalAgentSecret: string;
}
export declare function createApp(deps: AppDeps): Express;
//# sourceMappingURL=app.d.ts.map