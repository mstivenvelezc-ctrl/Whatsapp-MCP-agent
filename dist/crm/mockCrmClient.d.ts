import type { CreateAppointmentInput, CreateOrderInput, CrmAppointment, CrmClient, CrmOrder, CrmProduct, EscalateToAgentInput, EscalateToAgentResult, LogMessageInput } from "./types.js";
export declare class MockCrmClient implements CrmClient {
    private readonly appointments;
    private readonly orders;
    private readonly loggedMessages;
    private readonly escalations;
    private nextId;
    private nextOrderId;
    simulateOutOfHours: boolean;
    getAvailableDates(): Promise<string[]>;
    getAvailableSlots(_date: string): Promise<string[]>;
    createAppointment(input: CreateAppointmentInput): Promise<CrmAppointment>;
    listAppointments(): CrmAppointment[];
    listActiveProducts(): Promise<CrmProduct[]>;
    createOrder(input: CreateOrderInput): Promise<CrmOrder>;
    listOrders(): CrmOrder[];
    logMessage(input: LogMessageInput): Promise<void>;
    listLoggedMessages(): LogMessageInput[];
    escalateToAgent(input: EscalateToAgentInput): Promise<EscalateToAgentResult>;
    listEscalations(): EscalateToAgentInput[];
}
//# sourceMappingURL=mockCrmClient.d.ts.map