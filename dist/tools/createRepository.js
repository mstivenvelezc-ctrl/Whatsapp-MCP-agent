import { getOctokit } from "../github/client.js";
import { fail, githubErrorMessage, ok } from "../lib/result.js";
import { isPrivateSchema, repoDescriptionSchema, repoNameSchema, } from "../schemas/github.js";
export function registerCreateRepositoryTool(server) {
    server.registerTool("create_repository", {
        title: "Crear repositorio",
        description: "Crea un nuevo repositorio en la cuenta del usuario autenticado, con nombre y descripción.",
        inputSchema: {
            name: repoNameSchema,
            description: repoDescriptionSchema,
            isPrivate: isPrivateSchema,
        },
    }, async ({ name, description, isPrivate }) => {
        try {
            const octokit = getOctokit();
            const { data } = await octokit.repos.createForAuthenticatedUser({
                name,
                private: isPrivate,
                ...(description !== undefined && { description }),
            });
            return ok(`Repositorio creado: ${data.full_name}\n` +
                `Privado: ${data.private ? "sí" : "no"}\n` +
                `URL: ${data.html_url}`);
        }
        catch (error) {
            return fail(githubErrorMessage(error));
        }
    });
}
//# sourceMappingURL=createRepository.js.map