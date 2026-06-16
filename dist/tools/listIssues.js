import { getOctokit } from "../github/client.js";
import { fail, githubErrorMessage, ok } from "../lib/result.js";
import { issueStateSchema, ownerSchema, perPageSchema, repoNameSchema, } from "../schemas/github.js";
export function registerListIssuesTool(server) {
    server.registerTool("list_issues", {
        title: "Listar issues",
        description: "Lista los issues de un repositorio (por defecto solo los abiertos).",
        inputSchema: {
            owner: ownerSchema,
            repo: repoNameSchema,
            state: issueStateSchema,
            perPage: perPageSchema,
        },
    }, async ({ owner, repo, state, perPage }) => {
        try {
            const octokit = getOctokit();
            const { data } = await octokit.issues.listForRepo({
                owner,
                repo,
                state,
                per_page: perPage,
            });
            // GitHub devuelve los pull requests como issues; los filtramos.
            const issues = data.filter((item) => !item.pull_request);
            if (issues.length === 0) {
                return ok(`No hay issues (${state}) en ${owner}/${repo}.`);
            }
            const lines = issues
                .map((issue) => `#${issue.number} [${issue.state}] ${issue.title}`)
                .join("\n");
            return ok(`Issues de ${owner}/${repo} (${issues.length}):\n${lines}`);
        }
        catch (error) {
            return fail(githubErrorMessage(error));
        }
    });
}
//# sourceMappingURL=listIssues.js.map