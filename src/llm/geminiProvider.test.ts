import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGenerateContent = vi.fn();
vi.mock("@google/genai", () => ({
    GoogleGenAI: vi.fn().mockImplementation(() => ({
        models: { generateContent: mockGenerateContent },
    })),
}));

const { GeminiProvider } = await import("./geminiProvider.js");

describe("GeminiProvider", () => {
    beforeEach(() => {
        mockGenerateContent.mockReset();
    });

    it("maps a text-only response to the neutral shape", async () => {
        mockGenerateContent.mockResolvedValue({
            candidates: [{ content: { parts: [{ text: "hola" }] }, finishReason: "STOP" }],
        });

        const provider = new GeminiProvider("key", "model");
        const result = await provider.createMessage("system", [{ role: "user", text: "hi" }], []);

        expect(result).toEqual({ text: "hola", toolCalls: [], stopReason: "end" });
    });

    it("maps a function-call response to the neutral shape", async () => {
        mockGenerateContent.mockResolvedValue({
            candidates: [{ content: { parts: [{ functionCall: { name: "foo", args: { a: 1 } } }] } }],
        });

        const provider = new GeminiProvider("key", "model");
        const result = await provider.createMessage("system", [], []);

        expect(result.toolCalls).toEqual([{ id: "foo_0", name: "foo", input: { a: 1 } }]);
        expect(result.stopReason).toBe("tool_use");
    });

    it("translates tool results from history into functionResponse parts", async () => {
        mockGenerateContent.mockResolvedValue({ candidates: [{ content: { parts: [{ text: "ok" }] } }] });

        const provider = new GeminiProvider("key", "model");
        await provider.createMessage("system", [
            { role: "user", toolResults: [{ id: "t1", name: "foo", output: { ok: true }, isError: false }] },
        ], []);

        const sentContents = mockGenerateContent.mock.calls[0][0].contents;
        expect(sentContents[0]).toEqual({
            role: "user",
            parts: [{ functionResponse: { name: "foo", response: { result: { ok: true } } } }],
        });
    });

    it("wraps SDK failures in an UpstreamServiceError", async () => {
        mockGenerateContent.mockRejectedValue(new Error("network down"));

        const provider = new GeminiProvider("key", "model");
        await expect(provider.createMessage("system", [], [])).rejects.toThrow(/network down/);
    });
});
