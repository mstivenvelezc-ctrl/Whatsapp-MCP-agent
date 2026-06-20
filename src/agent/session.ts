import type { LlmMessage } from "../llm/types.js";

export type ConversationStage =
    | "welcome"
    | "menu"
    | "scheduling_appointment"
    | "handed_off_to_advisor"
    | "closed";

export interface ConversationSession {
    /** Clave interna del store. Para uso multi-tenant suele ser `${companyId}:${phone}`. */
    key: string;
    phone: string;
    contactName: string | undefined;
    stage: ConversationStage;
    history: LlmMessage[];
    updatedAt: number;
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 6;

export class SessionStore {
    private readonly sessions = new Map<string, ConversationSession>();

    getOrCreate(key: string, phone: string, contactName: string | undefined): ConversationSession {
        const existing = this.sessions.get(key);
        if (existing && Date.now() - existing.updatedAt < SESSION_TTL_MS) {
            if (contactName) existing.contactName = contactName;
            return existing;
        }

        const session: ConversationSession = {
            key,
            phone,
            contactName,
            stage: "welcome",
            history: [],
            updatedAt: Date.now(),
        };
        this.sessions.set(key, session);
        return session;
    }

    save(session: ConversationSession): void {
        session.updatedAt = Date.now();
        this.sessions.set(session.key, session);
    }

    reset(key: string): void {
        this.sessions.delete(key);
    }
}
