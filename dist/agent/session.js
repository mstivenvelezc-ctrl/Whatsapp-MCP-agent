const SESSION_TTL_MS = 1000 * 60 * 60 * 6;
export class SessionStore {
    sessions = new Map();
    getOrCreate(phone, contactName) {
        const existing = this.sessions.get(phone);
        if (existing && Date.now() - existing.updatedAt < SESSION_TTL_MS) {
            if (contactName)
                existing.contactName = contactName;
            return existing;
        }
        const session = {
            phone,
            contactName,
            stage: "welcome",
            history: [],
            updatedAt: Date.now(),
        };
        this.sessions.set(phone, session);
        return session;
    }
    save(session) {
        session.updatedAt = Date.now();
        this.sessions.set(session.phone, session);
    }
    reset(phone) {
        this.sessions.delete(phone);
    }
}
//# sourceMappingURL=session.js.map