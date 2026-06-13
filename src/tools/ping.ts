import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import {z as zod} from "zod";

export function registerPingTool(server: McpServer ) {

    server.registerTool("ping", {
    description: "health check tool. Returns pong.",
    inputSchema: {
        message: zod.string().optional(),
    },
},
    async ({message}) => ({
        content: [{type: "text", text: message ? `pong: ${message}` : "pong"}],
    }),
);
}