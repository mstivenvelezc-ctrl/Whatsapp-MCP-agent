export declare abstract class AppError extends Error {
    readonly cause?: unknown | undefined;
    abstract readonly statusCode: number;
    abstract readonly code: string;
    constructor(message: string, cause?: unknown | undefined);
    toJSON(): {
        error: string;
        message: string;
    };
}
export declare class ValidationError extends AppError {
    readonly statusCode = 400;
    readonly code = "VALIDATION_ERROR";
}
export declare class UnauthorizedError extends AppError {
    readonly statusCode = 401;
    readonly code = "UNAUTHORIZED";
}
export declare class NotFoundError extends AppError {
    readonly statusCode = 404;
    readonly code = "NOT_FOUND";
}
export declare class UpstreamServiceError extends AppError {
    readonly service: string;
    readonly statusCode = 502;
    readonly code = "UPSTREAM_SERVICE_ERROR";
    constructor(service: string, message: string, cause?: unknown);
}
export declare class InternalError extends AppError {
    readonly statusCode = 500;
    readonly code = "INTERNAL_ERROR";
}
export declare function toAppError(error: unknown): AppError;
//# sourceMappingURL=errors.d.ts.map