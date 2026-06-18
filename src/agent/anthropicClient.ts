import Anthropic from "@anthropic-ai/sdk";
import type { Fetch } from "@anthropic-ai/sdk/core";

// Algunos entornos (p.ej. Fly.io) reusan conexiones HTTP keep-alive que el servidor remoto ya
// cerró, lo que produce errores intermitentes "Premature close" en el fetch nativo de Node.
// Forzar Connection: close evita reusar sockets potencialmente muertos, a costa de una conexión
// TCP/TLS nueva por request.
const fetchWithoutKeepAlive: Fetch = async (url, init) => {
    const headers = { ...(init?.headers as Record<string, string> | undefined), Connection: "close" };
    return fetch(url as string, { ...init, headers, keepalive: false } as RequestInit) as unknown as ReturnType<Fetch>;
};

export function createAnthropicClient(apiKey: string): Anthropic {
    return new Anthropic({ apiKey, fetch: fetchWithoutKeepAlive });
}
