import { randomUUID } from "node:crypto";
export class MockCrmClient {
    contactsByPhone = new Map();
    appointments = [];
    async findContactByPhone(phone) {
        return this.contactsByPhone.get(phone);
    }
    async createContact(input) {
        const contact = { id: randomUUID(), fullName: input.fullName, phone: input.phone };
        this.contactsByPhone.set(input.phone, contact);
        return contact;
    }
    async createAppointment(input) {
        let contact = await this.findContactByPhone(input.contact.phone);
        if (!contact) {
            contact = await this.createContact(input.contact);
        }
        const appointment = {
            id: randomUUID(),
            contactId: contact.id,
            startsAt: input.startsAt,
            reason: input.reason,
            status: "scheduled",
        };
        this.appointments.push(appointment);
        return appointment;
    }
    listAppointments() {
        return [...this.appointments];
    }
}
//# sourceMappingURL=mockCrmClient.js.map