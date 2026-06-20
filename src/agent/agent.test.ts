import { describe, expect, it, vi } from "vitest";
import { Agent } from "./agent.js";
import { SessionStore } from "./session.js";
import { MockCrmClient } from "../crm/mockCrmClient.js";
import type { LlmClient, LlmResponse } from "../llm/types.js";

function textResponse(text: string): LlmResponse {
    return { text, toolCalls: [], stopReason: "end" };
}

function toolUseResponse(toolName: string, input: Record<string, unknown>): LlmResponse {
    return { toolCalls: [{ id: "tool_1", name: toolName, input }], stopReason: "tool_use" };
}

function buildAgent(createMessage: ReturnType<typeof vi.fn>): { agent: Agent; sessionStore: SessionStore } {
    const llmClient: LlmClient = { createMessage };
    const agent = new Agent({ llmClient, crmClient: new MockCrmClient() });
    return { agent, sessionStore: new SessionStore() };
}

describe("Agent.respond", () => {
    it("returns the assistant text when there is no tool use", async () => {
        const createMessage = vi.fn().mockResolvedValue(textResponse("¡Hola! ¿En qué te ayudo?"));
        const { agent, sessionStore } = buildAgent(createMessage);
        const session = sessionStore.getOrCreate("+1555", "+1555", "Jane");

        const reply = await agent.respond(session, "hola");

        expect(reply).toBe("¡Hola! ¿En qué te ayudo?");
        expect(createMessage).toHaveBeenCalledTimes(1);
        expect(session.history).toHaveLength(2);
    });

    it("executes the requested tool and feeds the result back before answering", async () => {
        const createMessage = vi
            .fn()
            .mockResolvedValueOnce(toolUseResponse("show_welcome_menu", {}))
            .mockResolvedValueOnce(textResponse("Aquí tienes el menú"));
        const { agent, sessionStore } = buildAgent(createMessage);
        const session = sessionStore.getOrCreate("+1555", "+1555", "Jane");

        const reply = await agent.respond(session, "hola");

        expect(reply).toBe("Aquí tienes el menú");
        expect(session.stage).toBe("menu");
        expect(createMessage).toHaveBeenCalledTimes(2);

        const toolResultMessage = session.history.find((message) => message.toolResults !== undefined);
        expect(toolResultMessage).toBeDefined();
    });

    it("does not call the LLM when the conversation was handed off to an advisor", async () => {
        const createMessage = vi.fn();
        const { agent, sessionStore } = buildAgent(createMessage);
        const session = sessionStore.getOrCreate("+1555", "+1555", "Jane");
        session.stage = "handed_off_to_advisor";

        const reply = await agent.respond(session, "¿sigues ahí?");

        expect(reply).toBeUndefined();
        expect(createMessage).not.toHaveBeenCalled();
    });

    it("gives up with a fallback message after too many tool-use iterations", async () => {
        const createMessage = vi.fn().mockResolvedValue(toolUseResponse("show_welcome_menu", {}));
        const { agent, sessionStore } = buildAgent(createMessage);
        const session = sessionStore.getOrCreate("+1555", "+1555", "Jane");

        const reply = await agent.respond(session, "hola");

        expect(reply).toContain("asesor");
        expect(createMessage).toHaveBeenCalledTimes(6);
    });
});
