import { describe, expect, it } from "vitest";
import { dispatchTool, getToolDefinitions } from "./registry.js";
import { MockCrmClient } from "../crm/mockCrmClient.js";
import type { ConversationSession } from "../agent/session.js";

function buildSession(overrides: Partial<ConversationSession> = {}): ConversationSession {
    return {
        key: "+15551234567",
        phone: "+15551234567",
        contactName: "Jane Doe",
        stage: "welcome",
        history: [],
        updatedAt: Date.now(),
        ...overrides,
    };
}

describe("getToolDefinitions", () => {
    it("exposes all registered tools with a name, description and input schema", () => {
        const definitions = getToolDefinitions();
        const names = definitions.map((tool) => tool.name);

        expect(names).toEqual([
            "show_welcome_menu",
            "select_service",
            "list_available_dates",
            "list_available_slots",
            "schedule_appointment",
            "list_products",
            "create_order",
            "escalate_to_advisor",
        ]);
        for (const definition of definitions) {
            expect(definition.description.length).toBeGreaterThan(0);
            expect(definition.input_schema).toBeDefined();
        }
    });
});

describe("dispatchTool", () => {
    it("returns an error result for an unknown tool", async () => {
        const session = buildSession();
        const result = await dispatchTool("not_a_real_tool", {}, { session, crmClient: new MockCrmClient() });

        expect(result.isError).toBe(true);
        expect(result.output).toMatchObject({ error: expect.stringContaining("not_a_real_tool") });
    });

    it("returns a validation error result when the input does not match the schema", async () => {
        const session = buildSession();
        const result = await dispatchTool(
            "select_service",
            { service: "not-a-valid-option" },
            { session, crmClient: new MockCrmClient() },
        );

        expect(result.isError).toBe(true);
    });

    it("show_welcome_menu sets the session stage to menu", async () => {
        const session = buildSession();
        const result = await dispatchTool("show_welcome_menu", {}, { session, crmClient: new MockCrmClient() });

        expect(result.isError).toBe(false);
        expect(session.stage).toBe("menu");
    });

    it("select_service moves the session into the scheduling flow", async () => {
        const session = buildSession({ stage: "menu" });
        const result = await dispatchTool(
            "select_service",
            { service: "agendar_cita" },
            { session, crmClient: new MockCrmClient() },
        );

        expect(result.isError).toBe(false);
        expect(session.stage).toBe("scheduling_appointment");
    });

    it("escalate_to_advisor hands off the conversation and stops the bot", async () => {
        const session = buildSession({ stage: "menu" });
        const result = await dispatchTool(
            "escalate_to_advisor",
            { reason: "El usuario pidió hablar con una persona" },
            { session, crmClient: new MockCrmClient() },
        );

        expect(result.isError).toBe(false);
        expect(session.stage).toBe("handed_off_to_advisor");
    });

    it("list_available_dates returns the dates from the CRM", async () => {
        const session = buildSession();
        const crmClient = new MockCrmClient();

        const result = await dispatchTool("list_available_dates", {}, { session, crmClient });

        expect(result.isError).toBe(false);
        expect(result.output).toMatchObject({ dates: expect.arrayContaining([expect.any(String)]) });
    });

    it("list_available_slots returns the slots for a given date", async () => {
        const session = buildSession();
        const crmClient = new MockCrmClient();

        const result = await dispatchTool("list_available_slots", { date: "2030-01-02" }, { session, crmClient });

        expect(result.isError).toBe(false);
        expect(result.output).toMatchObject({ slots: expect.arrayContaining([expect.any(String)]) });
    });

    it("schedule_appointment rejects a date in the past", async () => {
        const session = buildSession({ stage: "scheduling_appointment" });
        const crmClient = new MockCrmClient();

        const result = await dispatchTool(
            "schedule_appointment",
            { fullName: "Jane Doe", appointmentDate: "2000-01-01", appointmentTime: "10:00" },
            { session, crmClient },
        );

        expect(result.isError).toBe(true);
    });

    it("schedule_appointment creates the appointment and closes the session on success", async () => {
        const session = buildSession({ stage: "scheduling_appointment" });
        const crmClient = new MockCrmClient();
        const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 10);

        const result = await dispatchTool(
            "schedule_appointment",
            { fullName: "Jane Doe", appointmentDate: futureDate, appointmentTime: "10:00" },
            { session, crmClient },
        );

        expect(result.isError).toBe(false);
        expect(session.stage).toBe("closed");
        expect(crmClient.listAppointments()).toHaveLength(1);
    });

    it("list_products returns the CRM catalog", async () => {
        const session = buildSession();
        const crmClient = new MockCrmClient();

        const result = await dispatchTool("list_products", {}, { session, crmClient });

        expect(result.isError).toBe(false);
        expect(result.output).toMatchObject({ products: expect.arrayContaining([expect.objectContaining({ id: 1 })]) });
    });

    it("create_order creates an order priced from the CRM catalog", async () => {
        const session = buildSession();
        const crmClient = new MockCrmClient();

        const result = await dispatchTool(
            "create_order",
            { type: "PEDIDO", items: [{ productId: 1, quantity: 2 }] },
            { session, crmClient },
        );

        expect(result.isError).toBe(false);
        expect(crmClient.listOrders()).toHaveLength(1);
        expect(crmClient.listOrders()[0]).toMatchObject({ total: 200000 });
    });
});
