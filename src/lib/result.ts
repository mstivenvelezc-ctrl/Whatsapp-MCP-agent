export function ok(text: string) {
    return { content: [{ type: "text" as const, text }] };
}

export function fail(text: string) {
    return { content: [{ type: "text" as const, text }], isError: true };
}

// Octokit lanza errores con `status` (HTTP) y `message`.
export function githubErrorMessage(error: unknown): string {
    if (typeof error === "object" && error !== null && "status" in error) {
        const e = error as { status?: number; message?: string };
        const status = e.status ? ` (HTTP ${e.status})` : "";
        return `Error de la API de GitHub${status}: ${e.message ?? "error desconocido"}`;
    }
    return error instanceof Error ? error.message : "Error desconocido.";
}