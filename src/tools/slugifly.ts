import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import {z as zod} from "zod";

export function registerSlugiflyTool(server: McpServer ) {
    server.registerTool("slugifly", {
        description: "Converts a text string into a URL-friendly slug.",
        inputSchema: {text: zod.string()},
    },
        async ({text}) => {
            const slug = text
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_]+/g, "-")
                .replace(/^-+|-+$/g, "");
            return {
                content: [{type: "text", text: slug}]};
            },
    );
}