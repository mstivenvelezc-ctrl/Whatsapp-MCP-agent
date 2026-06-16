import { Octokit } from "@octokit/rest";
let octokit = null;
export function getOctokit() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error("Falta la variable de entorno GITHUB_TOKEN. Crea un Personal Access Token " +
            "en GitHub (Settings → Developer settings → Tokens) y expórtalo antes de iniciar el servidor.");
    }
    if (!octokit) {
        octokit = new Octokit({ auth: token });
    }
    return octokit;
}
//# sourceMappingURL=client.js.map