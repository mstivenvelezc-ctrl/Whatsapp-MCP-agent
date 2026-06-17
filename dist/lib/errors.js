export class AppError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = this.constructor.name;
    }
    toJSON() {
        return { error: this.code, message: this.message };
    }
}
export class ValidationError extends AppError {
    statusCode = 400;
    code = "VALIDATION_ERROR";
}
export class UnauthorizedError extends AppError {
    statusCode = 401;
    code = "UNAUTHORIZED";
}
export class NotFoundError extends AppError {
    statusCode = 404;
    code = "NOT_FOUND";
}
export class UpstreamServiceError extends AppError {
    service;
    statusCode = 502;
    code = "UPSTREAM_SERVICE_ERROR";
    constructor(service, message, cause) {
        super(message, cause);
        this.service = service;
    }
}
export class InternalError extends AppError {
    statusCode = 500;
    code = "INTERNAL_ERROR";
}
export function toAppError(error) {
    if (error instanceof AppError)
        return error;
    if (error instanceof Error)
        return new InternalError(error.message, error);
    return new InternalError("Unknown error", error);
}
//# sourceMappingURL=errors.js.map