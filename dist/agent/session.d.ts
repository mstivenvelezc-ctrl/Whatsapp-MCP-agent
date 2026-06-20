import type { LlmMessage } from "../llm/types.js";
export type ConversationStage = "welcome" | "menu" | "scheduling_appointment" | "handed_off_to_advisor" | "closed";
export interface ConversationSession {
    /** Clave interna del store. Para uso multi-tenant suele ser `${companyId}:${phone}`. */
    key: string;
    phone: string;
    contactName: string | undefined;
    stage: ConversationStage;
    history: LlmMessage[];
    updatedAt: number;
}
export declare class SessionStore {
    private readonly sessions;
    getOrCreate(key: string, phone: string, contactName: string | undefined): ConversationSession;
    save(session: ConversationSession): void;
    reset(key: string): void;
}
//# sourceMappingURL=session.d.ts.map