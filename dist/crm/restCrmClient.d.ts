import type { CreateAppointmentInput, CreateOrderInput, CrmAppointment, CrmClient, CrmOrder, CrmProduct, EscalateToAgentInput, EscalateToAgentResult, LogMessageInput } from "./types.js";
export interface RestCrmClientConfig {
    baseUrl: string;
    apiKey: string;
    fetchImpl?: typeof fetch;
}
export declare class RestCrmClient implements CrmClient {
    private readonly config;
    private readonly fetchImpl;
    constructor(config: RestCrmClientConfig);
    getAvailableDates(): Promise<string[]>;
    getAvailableSlots(date: string): Promise<string[]>;
    createAppointment(input: CreateAppointmentInput): Promise<CrmAppointment>;
    listActiveProducts(): Promise<CrmProduct[]>;
    createOrder(input: CreateOrderInput): Promise<CrmOrder>;
    logMessage(input: LogMessageInput): Promise<void>;
    escalateToAgent(input: EscalateToAgentInput): Promise<EscalateToAgentResult>;
    private request;
    private parseJson;
}
//# sourceMappingURL=restCrmClient.d.ts.map