import type { CreateAppointmentInput, CrmAppointment, CrmClient, CrmContact } from "./types.js";
export declare class MockCrmClient implements CrmClient {
    private readonly contactsByPhone;
    private readonly appointments;
    findContactByPhone(phone: string): Promise<CrmContact | undefined>;
    createContact(input: {
        phone: string;
        fullName: string;
    }): Promise<CrmContact>;
    createAppointment(input: CreateAppointmentInput): Promise<CrmAppointment>;
    listAppointments(): CrmAppointment[];
}
//# sourceMappingURL=mockCrmClient.d.ts.map