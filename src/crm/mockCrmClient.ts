import { randomUUID } from "node:crypto";
import type { CreateAppointmentInput, CrmAppointment, CrmClient, CrmContact } from "./types.js";

export class MockCrmClient implements CrmClient {
    private readonly contactsByPhone = new Map<string, CrmContact>();
    private readonly appointments: CrmAppointment[] = [];

    async findContactByPhone(phone: string): Promise<CrmContact | undefined> {
        return this.contactsByPhone.get(phone);
    }

    async createContact(input: { phone: string; fullName: string }): Promise<CrmContact> {
        const contact: CrmContact = { id: randomUUID(), fullName: input.fullName, phone: input.phone };
        this.contactsByPhone.set(input.phone, contact);
        return contact;
    }

    async createAppointment(input: CreateAppointmentInput): Promise<CrmAppointment> {
        let contact = await this.findContactByPhone(input.contact.phone);
        if (!contact) {
            contact = await this.createContact(input.contact);
        }

        const appointment: CrmAppointment = {
            id: randomUUID(),
            contactId: contact.id,
            startsAt: input.startsAt,
            reason: input.reason,
            status: "scheduled",
        };
        this.appointments.push(appointment);
        return appointment;
    }

    listAppointments(): CrmAppointment[] {
        return [...this.appointments];
    }
}
