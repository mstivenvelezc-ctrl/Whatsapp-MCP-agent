import { z as zod } from "zod";
export function registerSlugiflyTool(server) {
    server.registerTool("slugifly", {
        description: "Converts a text string into a URL-friendly slug.",
        inputSchema: { text: zod.string() },
    }, async ({ text }) => {
        const slug = text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_]+/g, "-")
            .replace(/^-+|-+$/g, "");
        return {
            content: [{ type: "text", text: slug }]
        };
    });
}
//# sourceMappingURL=slugifly.js.map