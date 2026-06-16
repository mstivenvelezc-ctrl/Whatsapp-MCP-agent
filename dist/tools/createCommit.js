import { getOctokit } from "../github/client.js";
import { fail, githubErrorMessage, ok } from "../lib/result.js";
import { branchSchema, commitMessageSchema, fileContentSchema, filePathSchema, ownerSchema, repoNameSchema, } from "../schemas/github.js";
export function registerCreateCommitTool(server) {
    server.registerTool("create_commit", {
        title: "Crear commit",
        description: "Crea un commit agregando o modificando un archivo en un repositorio. " +
            "Si el archivo ya existe, lo actualiza.",
        inputSchema: {
            owner: ownerSchema,
            repo: repoNameSchema,
            path: filePathSchema,
            content: fileContentSchema,
            message: commitMessageSchema,
            branch: branchSchema,
        },
    }, async ({ owner, repo, path, content, message, branch }) => {
        try {
            const octokit = getOctokit();
            // Si el archivo ya existe necesitamos su `sha` para actualizarlo.
            let sha;
            try {
                const existing = await octokit.repos.getContent({
                    owner,
                    repo,
                    path,
                    ...(branch !== undefined && { ref: branch }),
                });
                if (!Array.isArray(existing.data) && "sha" in existing.data) {
                    sha = existing.data.sha;
                }
            }
            catch (error) {
                // 404 = el archivo no existe todavía → se creará. Otros errores se relanzan.
                if (!(typeof error === "object" && error !== null && "status" in error &&
                    error.status === 404)) {
                    throw error;
                }
            }
            const { data } = await octokit.repos.createOrUpdateFileContents({
                owner,
                repo,
                path,
                message,
                content: Buffer.from(content, "utf-8").toString("base64"),
                ...(branch !== undefined && { branch }),
                ...(sha !== undefined && { sha }),
            });
            return ok(`${sha ? "Archivo actualizado" : "Archivo creado"}: ${path}\n` +
                `Commit: ${data.commit.sha}\n` +
                `URL: ${data.content?.html_url ?? "(sin URL)"}`);
        }
        catch (error) {
            return fail(githubErrorMessage(error));
        }
    });
}
//# sourceMappingURL=createCommit.js.map