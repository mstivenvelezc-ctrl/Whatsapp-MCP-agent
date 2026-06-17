import { Router } from "express";
export function healthRouter() {
    const router = Router();
    router.get("/", (_req, res) => {
        res.status(200).json({ status: "ok" });
    });
    return router;
}
//# sourceMappingURL=health.route.js.map