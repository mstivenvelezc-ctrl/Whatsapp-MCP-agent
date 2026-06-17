import { Router } from "express";
import type Anthropic from "@anthropic-ai/sdk";
import type { SessionStore } from "../../agent/session.js";
export interface InternalAgentRouterDeps {
    anthropic: Anthropic;
    model: string;
    sessionStore: SessionStore;
    internalAgentSecret: string;
}
export declare function internalAgentRouter(deps: InternalAgentRouterDeps): Router;
//# sourceMappingURL=internalAgent.route.d.ts.map