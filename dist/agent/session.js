const SESSION_TTL_MS = 1000 * 60 * 60 * 6;
export class SessionStore {
    sessions = new Map();
    getOrCreate(key, phone, contactName) {
        const existing = this.sessions.get(key);
        if (existing && Date.now() - existing.updatedAt < SESSION_TTL_MS) {
            if (contactName)
                existing.contactName = contactName;
            return existing;
        }
        const session = {
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
    save(session) {
        session.updatedAt = Date.now();
        this.sessions.set(session.key, session);
    }
    reset(key) {
        this.sessions.delete(key);
    }
}
//# sourceMappingURL=session.js.map