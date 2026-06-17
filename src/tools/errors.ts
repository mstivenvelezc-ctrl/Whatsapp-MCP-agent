export class ToolValidationError extends Error {
    constructor(readonly toolName: string, message: string) {
        super(message);
        this.name = "ToolValidationError";
    }
}

export class ToolExecutionError extends Error {
    constructor(readonly toolName: string, message: string, readonly cause?: unknown) {
        super(message);
        this.name = "ToolExecutionError";
    }
}
