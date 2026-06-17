export abstract class AppError extends Error {
    abstract readonly statusCode: number;
    abstract readonly code: string;

    constructor(message: string, readonly cause?: unknown) {
        super(message);
        this.name = this.constructor.name;
    }

    toJSON() {
        return { error: this.code, message: this.message };
    }
}

export class ValidationError extends AppError {
    readonly statusCode = 400;
    readonly code = "VALIDATION_ERROR";
}

export class UnauthorizedError extends AppError {
    readonly statusCode = 401;
    readonly code = "UNAUTHORIZED";
}

export class NotFoundError extends AppError {
    readonly statusCode = 404;
    readonly code = "NOT_FOUND";
}

export class UpstreamServiceError extends AppError {
    readonly statusCode = 502;
    readonly code = "UPSTREAM_SERVICE_ERROR";

    constructor(readonly service: string, message: string, cause?: unknown) {
        super(message, cause);
    }
}

export class InternalError extends AppError {
    readonly statusCode = 500;
    readonly code = "INTERNAL_ERROR";
}

export function toAppError(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof Error) return new InternalError(error.message, error);
    return new InternalError("Unknown error", error);
}
