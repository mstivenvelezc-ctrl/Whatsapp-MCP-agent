import { describe, expect, it } from "vitest";
import { dispatchTool, getToolDefinitions } from "./registry.js";
import { MockCrmClient } from "../crm/mockCrmClient.js";
import type { ConversationSession } from "../agent/session.js";

function buildSession(overrides: Partial<ConversationSession> = {}): ConversationSession {
    return {
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
            "find_or_create_contact",
            "schedule_appointment",
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

    it("find_or_create_contact creates a contact when none exists yet", async () => {
        const session = buildSession();
        const crmClient = new MockCrmClient();

        const result = await dispatchTool("find_or_create_contact", { fullName: "Jane Doe" }, { session, crmClient });

        expect(result.isError).toBe(false);
        expect(result.output).toMatchObject({ created: true });
    });

    it("schedule_appointment rejects a date in the past", async () => {
        const session = buildSession({ stage: "scheduling_appointment" });
        const crmClient = new MockCrmClient();

        const result = await dispatchTool(
            "schedule_appointment",
            { fullName: "Jane Doe", startsAt: "2000-01-01T10:00:00.000Z", reason: "demo" },
            { session, crmClient },
        );

        expect(result.isError).toBe(true);
    });

    it("schedule_appointment creates the appointment and closes the session on success", async () => {
        const session = buildSession({ stage: "scheduling_appointment" });
        const crmClient = new MockCrmClient();
        const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

        const result = await dispatchTool(
            "schedule_appointment",
            { fullName: "Jane Doe", startsAt: futureDate, reason: "demo" },
            { session, crmClient },
        );

        expect(result.isError).toBe(false);
        expect(session.stage).toBe("closed");
        expect(crmClient.listAppointments()).toHaveLength(1);
    });
});
