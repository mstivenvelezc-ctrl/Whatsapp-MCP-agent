import { describe, expect, it, vi } from "vitest";
import { RestCrmClient } from "./restCrmClient.js";
import { UpstreamServiceError } from "../lib/errors.js";

function jsonResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("RestCrmClient", () => {
    it("fetches available dates from the CRM", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, ["2030-01-02", "2030-01-03"]));
        const client = new RestCrmClient({ baseUrl: "https://crm.test", apiKey: "token", fetchImpl });

        const dates = await client.getAvailableDates();

        expect(dates).toEqual(["2030-01-02", "2030-01-03"]);
        expect(fetchImpl).toHaveBeenCalledWith(
            "https://crm.test/api/appointments/available-dates",
            expect.objectContaining({ method: "GET" }),
        );
    });

    it("fetches available slots for a given date", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, ["08:00", "08:30"]));
        const client = new RestCrmClient({ baseUrl: "https://crm.test", apiKey: "token", fetchImpl });

        const slots = await client.getAvailableSlots("2030-01-02");

        expect(slots).toEqual(["08:00", "08:30"]);
        expect(fetchImpl).toHaveBeenCalledWith(
            "https://crm.test/api/appointments/available-slots?date=2030-01-02",
            expect.objectContaining({ method: "GET" }),
        );
    });

    it("creates an appointment with the expected request body", async () => {
        const appointment = {
            id: 1,
            clientPhone: "+1",
            clientName: "Jane",
            appointmentDate: "2030-01-02",
            appointmentTime: "08:00",
            status: "PENDING",
        };
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, appointment));
        const client = new RestCrmClient({ baseUrl: "https://crm.test", apiKey: "token", fetchImpl });

        const result = await client.createAppointment({
            clientPhone: "+1",
            clientName: "Jane",
            appointmentDate: "2030-01-02",
            appointmentTime: "08:00",
        });

        expect(result).toEqual(appointment);
        const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
        expect(url).toBe("https://crm.test/api/appointments");
        expect(init.method).toBe("POST");
        expect(init.headers).toMatchObject({ Authorization: "Bearer token" });
        expect(JSON.parse(init.body as string)).toEqual({
            clientPhone: "+1",
            clientName: "Jane",
            appointmentDate: "2030-01-02",
            appointmentTime: "08:00",
        });
    });

    it("fetches the active products catalog", async () => {
        const products = [{ id: 1, name: "Producto demo", price: 100000, currency: "COP", isActive: true }];
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, products));
        const client = new RestCrmClient({ baseUrl: "https://crm.test", apiKey: "token", fetchImpl });

        const result = await client.listActiveProducts();

        expect(result).toEqual(products);
        expect(fetchImpl).toHaveBeenCalledWith(
            "https://crm.test/api/products/active",
            expect.objectContaining({ method: "GET" }),
        );
    });

    it("creates an order pricing each item from the active products catalog", async () => {
        const products = [{ id: 1, name: "Producto demo", price: 100000, currency: "COP", isActive: true }];
        const order = { id: 1, clientPhone: "+1", type: "PEDIDO", status: "PENDIENTE", subtotal: 200000, discount: 0, total: 200000, items: [] };
        const fetchImpl = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse(200, products))
            .mockResolvedValueOnce(jsonResponse(200, order));
        const client = new RestCrmClient({ baseUrl: "https://crm.test", apiKey: "token", fetchImpl });

        const result = await client.createOrder({
            clientPhone: "+1",
            type: "PEDIDO",
            items: [{ productId: 1, quantity: 2 }],
        });

        expect(result).toEqual(order);
        const [url, init] = fetchImpl.mock.calls[1] as [string, RequestInit];
        expect(url).toBe("https://crm.test/api/orders");
        expect(JSON.parse(init.body as string)).toEqual({
            order: { clientPhone: "+1", type: "PEDIDO" },
            items: [{ productId: 1, productName: "Producto demo", quantity: 2, unitPrice: 100000, subtotal: 200000 }],
        });
    });

    it("rejects creating an order with an unknown productId", async () => {
        const products = [{ id: 1, name: "Producto demo", price: 100000, currency: "COP", isActive: true }];
        const fetchImpl = vi.fn().mockResolvedValueOnce(jsonResponse(200, products));
        const client = new RestCrmClient({ baseUrl: "https://crm.test", apiKey: "token", fetchImpl });

        await expect(
            client.createOrder({ clientPhone: "+1", type: "PEDIDO", items: [{ productId: 999, quantity: 1 }] }),
        ).rejects.toThrow(/999/);
    });

    it("logs a conversation message", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, {}));
        const client = new RestCrmClient({ baseUrl: "https://crm.test", apiKey: "token", fetchImpl });

        await client.logMessage({ clientPhone: "+1", clientName: "Jane", messageType: "USER", messageContent: "hola" });

        const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
        expect(url).toBe("https://crm.test/api/messages");
        expect(JSON.parse(init.body as string)).toEqual({
            clientPhone: "+1",
            messageType: "USER",
            messageContent: "hola",
            clientName: "Jane",
        });
    });

    it("throws UpstreamServiceError when the CRM responds with a server error", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(new Response("boom", { status: 500 }));
        const client = new RestCrmClient({ baseUrl: "https://crm.test", apiKey: "token", fetchImpl });

        await expect(client.getAvailableDates()).rejects.toBeInstanceOf(UpstreamServiceError);
    });

    it("throws UpstreamServiceError when fetch itself fails", async () => {
        const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
        const client = new RestCrmClient({ baseUrl: "https://crm.test", apiKey: "token", fetchImpl });

        await expect(client.getAvailableDates()).rejects.toBeInstanceOf(UpstreamServiceError);
    });
});
