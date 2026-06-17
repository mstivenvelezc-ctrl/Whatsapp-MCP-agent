import { describe, expect, it, vi } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { Agent } from "./agent.js";
import { SessionStore } from "./session.js";
import { MockCrmClient } from "../crm/mockCrmClient.js";

function textMessage(text: string): Anthropic.Message {
    return {
        id: "msg_1",
        type: "message",
        role: "assistant",
        model: "claude-sonnet-4-6",
        stop_reason: "end_turn",
        stop_sequence: null,
        content: [{ type: "text", text, citations: null }],
        usage: { input_tokens: 1, output_tokens: 1 },
    } as unknown as Anthropic.Message;
}

function toolUseMessage(toolName: string, input: Record<string, unknown>): Anthropic.Message {
    return {
        id: "msg_tool",
        type: "message",
        role: "assistant",
        model: "claude-sonnet-4-6",
        stop_reason: "tool_use",
        stop_sequence: null,
        content: [{ type: "tool_use", id: "tool_1", name: toolName, input }],
        usage: { input_tokens: 1, output_tokens: 1 },
    } as unknown as Anthropic.Message;
}

function buildAgent(create: ReturnType<typeof vi.fn>): { agent: Agent; sessionStore: SessionStore } {
    const fakeAnthropic = { messages: { create } } as unknown as Anthropic;
    const agent = new Agent({ anthropic: fakeAnthropic, model: "claude-sonnet-4-6", crmClient: new MockCrmClient() });
    return { agent, sessionStore: new SessionStore() };
}

describe("Agent.respond", () => {
    it("returns the assistant text when there is no tool use", async () => {
        const create = vi.fn().mockResolvedValue(textMessage("¡Hola! ¿En qué te ayudo?"));
        const { agent, sessionStore } = buildAgent(create);
        const session = sessionStore.getOrCreate("+1555", "+1555", "Jane");

        const reply = await agent.respond(session, "hola");

        expect(reply).toBe("¡Hola! ¿En qué te ayudo?");
        expect(create).toHaveBeenCalledTimes(1);
        expect(session.history).toHaveLength(2);
    });

    it("executes the requested tool and feeds the result back before answering", async () => {
        const create = vi
            .fn()
            .mockResolvedValueOnce(toolUseMessage("show_welcome_menu", {}))
            .mockResolvedValueOnce(textMessage("Aquí tienes el menú"));
        const { agent, sessionStore } = buildAgent(create);
        const session = sessionStore.getOrCreate("+1555", "+1555", "Jane");

        const reply = await agent.respond(session, "hola");

        expect(reply).toBe("Aquí tienes el menú");
        expect(session.stage).toBe("menu");
        expect(create).toHaveBeenCalledTimes(2);

        const toolResultMessage = session.history.find((message) =>
            Array.isArray(message.content) && message.content.some((block) => "type" in block && block.type === "tool_result"),
        );
        expect(toolResultMessage).toBeDefined();
    });

    it("does not call Anthropic when the conversation was handed off to an advisor", async () => {
        const create = vi.fn();
        const { agent, sessionStore } = buildAgent(create);
        const session = sessionStore.getOrCreate("+1555", "+1555", "Jane");
        session.stage = "handed_off_to_advisor";

        const reply = await agent.respond(session, "¿sigues ahí?");

        expect(reply).toBeUndefined();
        expect(create).not.toHaveBeenCalled();
    });

    it("gives up with a fallback message after too many tool-use iterations", async () => {
        const create = vi.fn().mockResolvedValue(toolUseMessage("show_welcome_menu", {}));
        const { agent, sessionStore } = buildAgent(create);
        const session = sessionStore.getOrCreate("+1555", "+1555", "Jane");

        const reply = await agent.respond(session, "hola");

        expect(reply).toContain("asesor");
        expect(create).toHaveBeenCalledTimes(6);
    });
});
