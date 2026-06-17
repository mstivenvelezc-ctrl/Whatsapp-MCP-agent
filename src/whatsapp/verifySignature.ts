import { createHmac, timingSafeEqual } from "node:crypto";

const SIGNATURE_PREFIX = "sha256=";

export function verifyWhatsappSignature(
    appSecret: string,
    rawBody: Buffer | string,
    signatureHeader: string | undefined,
): boolean {
    if (!signatureHeader || !signatureHeader.startsWith(SIGNATURE_PREFIX)) return false;

    const expectedHex = signatureHeader.slice(SIGNATURE_PREFIX.length);
    const computedHex = createHmac("sha256", appSecret).update(rawBody).digest("hex");

    const expected = Buffer.from(expectedHex, "hex");
    const computed = Buffer.from(computedHex, "hex");

    if (expected.length !== computed.length) return false;
    return timingSafeEqual(expected, computed);
}
