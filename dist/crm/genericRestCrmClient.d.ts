import type { CreateAppointmentInput, CrmAppointment, CrmClient, CrmContact } from "./types.js";
export interface GenericRestCrmClientConfig {
    baseUrl: string;
    apiKey: string;
    fetchImpl?: typeof fetch;
}
export declare class GenericRestCrmClient implements CrmClient {
    private readonly config;
    private readonly fetchImpl;
    constructor(config: GenericRestCrmClientConfig);
    findContactByPhone(phone: string): Promise<CrmContact | undefined>;
    createContact(input: {
        phone: string;
        fullName: string;
    }): Promise<CrmContact>;
    createAppointment(input: CreateAppointmentInput): Promise<CrmAppointment>;
    private request;
    private parseJson;
}
//# sourceMappingURL=genericRestCrmClient.d.ts.map