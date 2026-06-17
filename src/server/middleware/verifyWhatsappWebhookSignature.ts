import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../lib/errors.js";
import { verifyWhatsappSignature } from "../../whatsapp/verifySignature.js";

declare module "express-serve-static-core" {
    interface Request {
        rawBody?: Buffer;
    }
}

export function verifyWhatsappWebhookSignature(appSecret: string) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const signature = req.header("x-hub-signature-256");
        const rawBody = req.rawBody ?? Buffer.from("");

        if (!verifyWhatsappSignature(appSecret, rawBody, signature)) {
            next(new UnauthorizedError("Invalid WhatsApp webhook signature"));
            return;
        }

        next();
    };
}
