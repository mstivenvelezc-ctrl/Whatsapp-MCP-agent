export declare class ToolValidationError extends Error {
    readonly toolName: string;
    constructor(toolName: string, message: string);
}
export declare class ToolExecutionError extends Error {
    readonly toolName: string;
    readonly cause?: unknown | undefined;
    constructor(toolName: string, message: string, cause?: unknown | undefined);
}
//# sourceMappingURL=errors.d.ts.map