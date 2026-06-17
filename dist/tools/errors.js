export class ToolValidationError extends Error {
    toolName;
    constructor(toolName, message) {
        super(message);
        this.toolName = toolName;
        this.name = "ToolValidationError";
    }
}
export class ToolExecutionError extends Error {
    toolName;
    cause;
    constructor(toolName, message, cause) {
        super(message);
        this.toolName = toolName;
        this.cause = cause;
        this.name = "ToolExecutionError";
    }
}
//# sourceMappingURL=errors.js.map