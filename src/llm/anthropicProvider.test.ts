import { describe, expect, it, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
    default: vi.fn().mockImplementation(() => ({
        messages: { create: mockCreate },
    })),
}));

const { AnthropicProvider } = await import("./anthropicProvider.js");

describe("AnthropicProvider", () => {
    beforeEach(() => {
        mockCreate.mockReset();
    });

    it("maps a text-only response to the neutral shape", async () => {
        mockCreate.mockResolvedValue({
            content: [{ type: "text", text: "hola" }],
            stop_reason: "end_turn",
        });

        const provider = new AnthropicProvider("key", "model");
        const result = await provider.createMessage("system", [{ role: "user", text: "hi" }], []);

        expect(result).toEqual({ text: "hola", toolCalls: [], stopReason: "end" });
    });

    it("maps a tool-use response to the neutral shape", async () => {
        mockCreate.mockResolvedValue({
            content: [{ type: "tool_use", id: "t1", name: "foo", input: { a: 1 } }],
            stop_reason: "tool_use",
        });

        const provider = new AnthropicProvider("key", "model");
        const result = await provider.createMessage("system", [], []);

        expect(result.toolCalls).toEqual([{ id: "t1", name: "foo", input: { a: 1 } }]);
        expect(result.stopReason).toBe("tool_use");
    });

    it("translates tool results from history into tool_result content blocks", async () => {
        mockCreate.mockResolvedValue({ content: [], stop_reason: "end_turn" });

        const provider = new AnthropicProvider("key", "model");
        await provider.createMessage("system", [
            { role: "user", toolResults: [{ id: "t1", name: "foo", output: { ok: true }, isError: false }] },
        ], []);

        const sentMessages = mockCreate.mock.calls[0][0].messages;
        expect(sentMessages[0]).toEqual({
            role: "user",
            content: [{ type: "tool_result", tool_use_id: "t1", content: JSON.stringify({ ok: true }), is_error: false }],
        });
    });

    it("wraps SDK failures in an UpstreamServiceError", async () => {
        mockCreate.mockRejectedValue(new Error("network down"));

        const provider = new AnthropicProvider("key", "model");
        await expect(provider.createMessage("system", [], [])).rejects.toThrow(/network down/);
    });
});
