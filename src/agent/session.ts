import type Anthropic from "@anthropic-ai/sdk";

export type ConversationStage =
    | "welcome"
    | "menu"
    | "scheduling_appointment"
    | "handed_off_to_advisor"
    | "closed";

export interface ConversationSession {
    phone: string;
    contactName: string | undefined;
    stage: ConversationStage;
    history: Anthropic.MessageParam[];
    updatedAt: number;
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 6;

export class SessionStore {
    private readonly sessions = new Map<string, ConversationSession>();

    getOrCreate(phone: string, contactName: string | undefined): ConversationSession {
        const existing = this.sessions.get(phone);
        if (existing && Date.now() - existing.updatedAt < SESSION_TTL_MS) {
            if (contactName) existing.contactName = contactName;
            return existing;
        }

        const session: ConversationSession = {
            phone,
            contactName,
            stage: "welcome",
            history: [],
            updatedAt: Date.now(),
        };
        this.sessions.set(phone, session);
        return session;
    }

    save(session: ConversationSession): void {
        session.updatedAt = Date.now();
        this.sessions.set(session.phone, session);
    }

    reset(phone: string): void {
        this.sessions.delete(phone);
    }
}
