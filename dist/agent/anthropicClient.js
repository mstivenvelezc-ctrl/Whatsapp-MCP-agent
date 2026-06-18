import Anthropic from "@anthropic-ai/sdk";
// Algunos entornos (p.ej. Fly.io) reusan conexiones HTTP keep-alive que el servidor remoto ya
// cerró, lo que produce errores intermitentes "Premature close" en el fetch nativo de Node.
// Forzar Connection: close evita reusar sockets potencialmente muertos, a costa de una conexión
// TCP/TLS nueva por request.
const fetchWithoutKeepAlive = async (url, init) => {
    const headers = { ...init?.headers, Connection: "close" };
    return fetch(url, { ...init, headers, keepalive: false });
};
export function createAnthropicClient(apiKey) {
    return new Anthropic({ apiKey, fetch: fetchWithoutKeepAlive });
}
//# sourceMappingURL=anthropicClient.js.map