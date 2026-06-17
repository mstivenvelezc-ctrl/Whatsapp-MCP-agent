import { UnauthorizedError } from "../../lib/errors.js";
import { verifyWhatsappSignature } from "../../whatsapp/verifySignature.js";
export function verifyWhatsappWebhookSignature(appSecret) {
    return (req, _res, next) => {
        const signature = req.header("x-hub-signature-256");
        const rawBody = req.rawBody ?? Buffer.from("");
        if (!verifyWhatsappSignature(appSecret, rawBody, signature)) {
            next(new UnauthorizedError("Invalid WhatsApp webhook signature"));
            return;
        }
        next();
    };
}
//# sourceMappingURL=verifyWhatsappWebhookSignature.js.map