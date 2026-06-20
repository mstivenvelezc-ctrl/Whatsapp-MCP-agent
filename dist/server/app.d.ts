import { type Express } from "express";
import type { SessionStore } from "../agent/session.js";
import type { LlmModels } from "../llm/factory.js";
export interface AppDeps {
    sessionStore: SessionStore;
    models: LlmModels;
    internalAgentSecret: string;
}
export declare function createApp(deps: AppDeps): Express;
//# sourceMappingURL=app.d.ts.map