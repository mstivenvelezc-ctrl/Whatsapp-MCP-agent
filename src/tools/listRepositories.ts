import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getOctokit } from "../github/client.js";
import { fail, githubErrorMessage, ok } from "../lib/result.js";
import { perPageSchema } from "../schemas/github.js";

export function registerListRepositoriesTool(server: McpServer) {
    server.registerTool(
        "list_repositories",
        {
            title: "Listar repositorios",
            description:
                "Lista los repositorios del usuario autenticado, ordenados por última actualización.",
            inputSchema: {
                perPage: perPageSchema,
            },
        },
        async ({ perPage }) => {
            try {
                const octokit = getOctokit();
                const { data } = await octokit.repos.listForAuthenticatedUser({
                    per_page: perPage,
                    sort: "updated",
                });

                if (data.length === 0) {
                    return ok("No se encontraron repositorios.");
                }

                const lines = data
                    .map(
                        (repo) =>
                            `- ${repo.full_name} ${repo.private ? "(privado)" : "(público)"}` +
                            `${repo.description ? ` — ${repo.description}` : ""}`,
                    )
                    .join("\n");

                return ok(`Repositorios (${data.length}):\n${lines}`);
            } catch (error) {
                return fail(githubErrorMessage(error));
            }
        },
    );
}