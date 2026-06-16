import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getOctokit } from "../github/client.js";
import { fail, githubErrorMessage, ok } from "../lib/result.js";
import {
    issueBodySchema,
    issueTitleSchema,
    ownerSchema,
    repoNameSchema,
} from "../schemas/github.js";

export function registerCreateIssueTool(server: McpServer) {
    server.registerTool(
        "create_issue",
        {
            title: "Crear issue",
            description: "Abre un nuevo issue en un repositorio, con título y body.",
            inputSchema: {
                owner: ownerSchema,
                repo: repoNameSchema,
                title: issueTitleSchema,
                body: issueBodySchema,
            },
        },
        async ({ owner, repo, title, body }) => {
            try {
                const octokit = getOctokit();
                const { data } = await octokit.issues.create({
                    owner,
                    repo,
                    title,
                    ...(body !== undefined && { body }),
                });
                return ok(
                    `Issue #${data.number} creado en ${owner}/${repo}: ${data.title}\n` +
                    `URL: ${data.html_url}`,
                );
            } catch (error) {
                return fail(githubErrorMessage(error));
            }
        },
    );
}