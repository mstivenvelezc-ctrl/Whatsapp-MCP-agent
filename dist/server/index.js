import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerPingTool } from "../tools/ping.js";
import { registerSlugiflyTool } from "../tools/slugifly.js";
import { registerSumTool } from "../tools/sum.js";
export const server = new McpServer({
    name: "mstivenvelezc-ctrl-agent",
    version: "1.0.0",
});
async function main() {
    registerSumTool(server);
    registerSlugiflyTool(server);
    registerPingTool(server);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Server is running...");
}
main().catch((error) => {
    console.error("Error starting the server:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map