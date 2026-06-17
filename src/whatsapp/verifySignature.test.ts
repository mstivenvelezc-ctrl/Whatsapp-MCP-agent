import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyWhatsappSignature } from "./verifySignature.js";

const APP_SECRET = "test-secret";

function sign(body: string): string {
    return `sha256=${createHmac("sha256", APP_SECRET).update(body).digest("hex")}`;
}

describe("verifyWhatsappSignature", () => {
    it("accepts a correctly signed body", () => {
        const body = JSON.stringify({ hello: "world" });
        expect(verifyWhatsappSignature(APP_SECRET, body, sign(body))).toBe(true);
    });

    it("rejects a body signed with a different secret", () => {
        const body = JSON.stringify({ hello: "world" });
        const wrongSignature = `sha256=${createHmac("sha256", "other-secret").update(body).digest("hex")}`;
        expect(verifyWhatsappSignature(APP_SECRET, body, wrongSignature)).toBe(false);
    });

    it("rejects a tampered body", () => {
        const signature = sign(JSON.stringify({ hello: "world" }));
        const tamperedBody = JSON.stringify({ hello: "tampered" });
        expect(verifyWhatsappSignature(APP_SECRET, tamperedBody, signature)).toBe(false);
    });

    it("rejects a missing signature header", () => {
        expect(verifyWhatsappSignature(APP_SECRET, "{}", undefined)).toBe(false);
    });

    it("rejects a malformed signature header", () => {
        expect(verifyWhatsappSignature(APP_SECRET, "{}", "not-a-valid-signature")).toBe(false);
    });
});
