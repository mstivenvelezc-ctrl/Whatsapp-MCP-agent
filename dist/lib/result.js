export function ok(text) {
    return { content: [{ type: "text", text }] };
}
export function fail(text) {
    return { content: [{ type: "text", text }], isError: true };
}
// Octokit lanza errores con `status` (HTTP) y `message`.
export function githubErrorMessage(error) {
    if (typeof error === "object" && error !== null && "status" in error) {
        const e = error;
        const status = e.status ? ` (HTTP ${e.status})` : "";
        return `Error de la API de GitHub${status}: ${e.message ?? "error desconocido"}`;
    }
    return error instanceof Error ? error.message : "Error desconocido.";
}
//# sourceMappingURL=result.js.map