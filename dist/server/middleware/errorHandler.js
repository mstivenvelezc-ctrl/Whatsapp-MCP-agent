import { toAppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
export function notFoundHandler(req, res) {
    res.status(404).json({ error: "NOT_FOUND", message: `Route not found: ${req.method} ${req.path}` });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err, req, res, _next) {
    const appError = toAppError(err);
    logger.error("Request failed", {
        path: req.path,
        method: req.method,
        code: appError.code,
        message: appError.message,
    });
    res.status(appError.statusCode).json(appError.toJSON());
}
//# sourceMappingURL=errorHandler.js.map