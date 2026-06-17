import type Anthropic from "@anthropic-ai/sdk";
export type ConversationStage = "welcome" | "menu" | "scheduling_appointment" | "handed_off_to_advisor" | "closed";
export interface ConversationSession {
    phone: string;
    contactName: string | undefined;
    stage: ConversationStage;
    history: Anthropic.MessageParam[];
    updatedAt: number;
}
export declare class SessionStore {
    private readonly sessions;
    getOrCreate(phone: string, contactName: string | undefined): ConversationSession;
    save(session: ConversationSession): void;
    reset(phone: string): void;
}
//# sourceMappingURL=session.d.ts.map