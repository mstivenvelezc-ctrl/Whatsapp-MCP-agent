import { z as zod } from "zod";
export function registerSumTool(server) {
    server.registerTool("sum", {
        description: "Sums two numbers.",
        inputSchema: {
            a: zod.number(),
            b: zod.number()
        },
    }, async ({ a, b }) => ({
        content: [{ type: "text", text: String(a + b) }],
    }));
}
//# sourceMappingURL=sum.js.map