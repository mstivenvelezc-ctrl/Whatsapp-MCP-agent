import { UpstreamServiceError } from "../lib/errors.js";
export class GenericRestCrmClient {
    config;
    fetchImpl;
    constructor(config) {
        this.config = config;
        this.fetchImpl = config.fetchImpl ?? fetch;
    }
    async findContactByPhone(phone) {
        const response = await this.request("GET", `/contacts?phone=${encodeURIComponent(phone)}`);
        if (response.status === 404)
            return undefined;
        const data = (await this.parseJson(response));
        return data.contacts?.[0];
    }
    async createContact(input) {
        const response = await this.request("POST", "/contacts", input);
        return (await this.parseJson(response));
    }
    async createAppointment(input) {
        const response = await this.request("POST", "/appointments", input);
        return (await this.parseJson(response));
    }
    async request(method, path, body) {
        try {
            const response = await this.fetchImpl(`${this.config.baseUrl}${path}`, {
                method,
                headers: {
                    Authorization: `Bearer ${this.config.apiKey}`,
                    "Content-Type": "application/json",
                },
                ...(body ? { body: JSON.stringify(body) } : {}),
            });
            if (!response.ok && response.status !== 404) {
                const errorBody = await response.text().catch(() => "<no body>");
                throw new UpstreamServiceError("crm", `CRM responded with status ${response.status}: ${errorBody}`);
            }
            return response;
        }
        catch (error) {
            if (error instanceof UpstreamServiceError)
                throw error;
            throw new UpstreamServiceError("crm", "Failed to reach CRM service", error);
        }
    }
    async parseJson(response) {
        try {
            return await response.json();
        }
        catch (error) {
            throw new UpstreamServiceError("crm", "CRM returned an invalid JSON response", error);
        }
    }
}
//# sourceMappingURL=genericRestCrmClient.js.map