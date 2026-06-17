export interface CrmContact {
    id: string;
    fullName: string;
    phone: string;
}
export interface CreateAppointmentInput {
    contact: {
        phone: string;
        fullName: string;
    };
    startsAt: string;
    reason: string;
}
export interface CrmAppointment {
    id: string;
    contactId: string;
    startsAt: string;
    reason: string;
    status: "scheduled";
}
export interface CrmClient {
    findContactByPhone(phone: string): Promise<CrmContact | undefined>;
    createContact(input: {
        phone: string;
        fullName: string;
    }): Promise<CrmContact>;
    createAppointment(input: CreateAppointmentInput): Promise<CrmAppointment>;
}
//# sourceMappingURL=types.d.ts.map