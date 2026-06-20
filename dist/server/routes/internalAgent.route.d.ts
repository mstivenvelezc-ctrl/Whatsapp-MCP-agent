import { Router } from "express";
import type { SessionStore } from "../../agent/session.js";
import { type LlmModels } from "../../llm/factory.js";
export interface InternalAgentRouterDeps {
    models: LlmModels;
    sessionStore: SessionStore;
    internalAgentSecret: string;
}
export declare function internalAgentRouter(deps: InternalAgentRouterDeps): Router;
//# sourceMappingURL=internalAgent.route.d.ts.map