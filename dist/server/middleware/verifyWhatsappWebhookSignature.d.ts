import type { NextFunction, Request, Response } from "express";
declare module "express-serve-static-core" {
    interface Request {
        rawBody?: Buffer;
    }
}
export declare function verifyWhatsappWebhookSignature(appSecret: string): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=verifyWhatsappWebhookSignature.d.ts.map