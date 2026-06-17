import { describe, expect, it, vi } from "vitest";
import { GenericRestCrmClient } from "./genericRestCrmClient.js";
import { UpstreamServiceError } from "../lib/errors.js";

function jsonResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("GenericRestCrmClient", () => {
    it("returns undefined when the contact is not found", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
        const client = new GenericRestCrmClient({ baseUrl: "https://crm.test", apiKey: "key", fetchImpl });

        const contact = await client.findContactByPhone("+15551234567");

        expect(contact).toBeUndefined();
        expect(fetchImpl).toHaveBeenCalledWith(
            "https://crm.test/contacts?phone=%2B15551234567",
            expect.objectContaining({ method: "GET" }),
        );
    });

    it("returns the first matching contact", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, { contacts: [{ id: "c1", fullName: "Jane", phone: "+1" }] }));
        const client = new GenericRestCrmClient({ baseUrl: "https://crm.test", apiKey: "key", fetchImpl });

        const contact = await client.findContactByPhone("+1");

        expect(contact).toEqual({ id: "c1", fullName: "Jane", phone: "+1" });
    });

    it("creates an appointment with the expected request body", async () => {
        const appointment = { id: "a1", contactId: "c1", startsAt: "2030-01-01T10:00:00.000Z", reason: "demo", status: "scheduled" };
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(201, appointment));
        const client = new GenericRestCrmClient({ baseUrl: "https://crm.test", apiKey: "key", fetchImpl });

        const result = await client.createAppointment({
            contact: { phone: "+1", fullName: "Jane" },
            startsAt: "2030-01-01T10:00:00.000Z",
            reason: "demo",
        });

        expect(result).toEqual(appointment);
        const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
        expect(init.method).toBe("POST");
        expect(JSON.parse(init.body as string)).toEqual({
            contact: { phone: "+1", fullName: "Jane" },
            startsAt: "2030-01-01T10:00:00.000Z",
            reason: "demo",
        });
    });

    it("throws UpstreamServiceError when the CRM responds with a server error", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(new Response("boom", { status: 500 }));
        const client = new GenericRestCrmClient({ baseUrl: "https://crm.test", apiKey: "key", fetchImpl });

        await expect(client.createContact({ phone: "+1", fullName: "Jane" })).rejects.toBeInstanceOf(
            UpstreamServiceError,
        );
    });

    it("throws UpstreamServiceError when fetch itself fails", async () => {
        const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
        const client = new GenericRestCrmClient({ baseUrl: "https://crm.test", apiKey: "key", fetchImpl });

        await expect(client.createContact({ phone: "+1", fullName: "Jane" })).rejects.toBeInstanceOf(
            UpstreamServiceError,
        );
    });
});
