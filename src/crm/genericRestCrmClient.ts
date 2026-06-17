import { UpstreamServiceError } from "../lib/errors.js";
import type { CreateAppointmentInput, CrmAppointment, CrmClient, CrmContact } from "./types.js";

export interface GenericRestCrmClientConfig {
    baseUrl: string;
    apiKey: string;
    fetchImpl?: typeof fetch;
}

export class GenericRestCrmClient implements CrmClient {
    private readonly fetchImpl: typeof fetch;

    constructor(private readonly config: GenericRestCrmClientConfig) {
        this.fetchImpl = config.fetchImpl ?? fetch;
    }

    async findContactByPhone(phone: string): Promise<CrmContact | undefined> {
        const response = await this.request("GET", `/contacts?phone=${encodeURIComponent(phone)}`);
        if (response.status === 404) return undefined;

        const data = (await this.parseJson(response)) as { contacts?: CrmContact[] };
        return data.contacts?.[0];
    }

    async createContact(input: { phone: string; fullName: string }): Promise<CrmContact> {
        const response = await this.request("POST", "/contacts", input);
        return (await this.parseJson(response)) as CrmContact;
    }

    async createAppointment(input: CreateAppointmentInput): Promise<CrmAppointment> {
        const response = await this.request("POST", "/appointments", input);
        return (await this.parseJson(response)) as CrmAppointment;
    }

    private async request(method: string, path: string, body?: unknown): Promise<Response> {
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
                throw new UpstreamServiceError(
                    "crm",
                    `CRM responded with status ${response.status}: ${errorBody}`,
                );
            }

            return response;
        } catch (error) {
            if (error instanceof UpstreamServiceError) throw error;
            throw new UpstreamServiceError("crm", "Failed to reach CRM service", error);
        }
    }

    private async parseJson(response: Response): Promise<unknown> {
        try {
            return await response.json();
        } catch (error) {
            throw new UpstreamServiceError("crm", "CRM returned an invalid JSON response", error);
        }
    }
}
