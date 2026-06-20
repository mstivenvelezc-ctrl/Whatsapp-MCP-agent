import { describe, expect, it, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();
vi.mock("openai", () => ({
    default: vi.fn().mockImplementation(() => ({
        chat: { completions: { create: mockCreate } },
    })),
}));

const { OpenAiProvider } = await import("./openaiProvider.js");

describe("OpenAiProvider", () => {
    beforeEach(() => {
        mockCreate.mockReset();
    });

    it("maps a text-only response to the neutral shape", async () => {
        mockCreate.mockResolvedValue({
            choices: [{ message: { content: "hola" }, finish_reason: "stop" }],
        });

        const provider = new OpenAiProvider("key", "model");
        const result = await provider.createMessage("system", [{ role: "user", text: "hi" }], []);

        expect(result).toEqual({ text: "hola", toolCalls: [], stopReason: "end" });
    });

    it("maps a tool-call response to the neutral shape", async () => {
        mockCreate.mockResolvedValue({
            choices: [{
                message: {
                    content: null,
                    tool_calls: [{ id: "t1", type: "function", function: { name: "foo", arguments: '{"a":1}' } }],
                },
                finish_reason: "tool_calls",
            }],
        });

        const provider = new OpenAiProvider("key", "model");
        const result = await provider.createMessage("system", [], []);

        expect(result.toolCalls).toEqual([{ id: "t1", name: "foo", input: { a: 1 } }]);
        expect(result.stopReason).toBe("tool_use");
    });

    it("translates tool results from history into role:tool messages", async () => {
        mockCreate.mockResolvedValue({ choices: [{ message: { content: "ok" }, finish_reason: "stop" }] });

        const provider = new OpenAiProvider("key", "model");
        await provider.createMessage("system", [
            { role: "user", toolResults: [{ id: "t1", name: "foo", output: { ok: true }, isError: false }] },
        ], []);

        const sentMessages = mockCreate.mock.calls[0][0].messages;
        expect(sentMessages).toContainEqual({ role: "tool", tool_call_id: "t1", content: JSON.stringify({ ok: true }) });
    });

    it("wraps SDK failures in an UpstreamServiceError", async () => {
        mockCreate.mockRejectedValue(new Error("network down"));

        const provider = new OpenAiProvider("key", "model");
        await expect(provider.createMessage("system", [], [])).rejects.toThrow(/network down/);
    });
});
