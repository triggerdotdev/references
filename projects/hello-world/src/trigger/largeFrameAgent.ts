/**
 * A `chat.agent` that also writes to run-scoped streams, which the other agent
 * references do not cover.
 *
 * An agent has two independent stream surfaces: its own chat channel, and any
 * run-scoped streams it opens with `streams.append()`. Those resolve their
 * backend separately, so an agent using both at once is worth having as a
 * fixture.
 *
 * The records are deliberately large, since per-record size is what the
 * backends differ on. The model is mocked, so this spends no tokens and is
 * deterministic. Record count and size come from the last user message,
 * `"<count> <kb>"`, defaulting to 8 records of 250KB.
 */
import { chat } from "@trigger.dev/sdk/ai";
import { logger, streams } from "@trigger.dev/sdk";
import { type ModelMessage, simulateReadableStream, streamText } from "ai";
import { MockLanguageModelV3 } from "ai/test";

const DEFAULT_FRAME_COUNT = 8;
const DEFAULT_FRAME_KB = 250;

function parseConfig(messages: ModelMessage[]): { frameCount: number; frameKb: number } {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const content = lastUser?.content;
  let text = "";
  if (typeof content === "string") {
    text = content.trim();
  } else if (Array.isArray(content)) {
    const part = content.find((p) => p.type === "text");
    text = part && "text" in part ? part.text.trim() : "";
  }
  const [countRaw, kbRaw] = text.split(/\s+/);
  const frameCount = Number(countRaw);
  const frameKb = Number(kbRaw);
  return {
    frameCount: Number.isFinite(frameCount) && frameCount > 0 ? frameCount : DEFAULT_FRAME_COUNT,
    frameKb: Number.isFinite(frameKb) && frameKb > 0 ? frameKb : DEFAULT_FRAME_KB,
  };
}

export const largeFrameAgent = chat.agent({
  id: "large-frame-agent",
  run: async ({ messages, signal }) => {
    const { frameCount, frameKb } = parseConfig(messages);
    const frame = "a".repeat(frameKb * 1024);

    logger.info("emitting frames", { frameCount, frameKb });

    for (let i = 0; i < frameCount; i++) {
      await streams.append("frames", JSON.stringify({ i, frame }));
      await streams.append("frameIndex", JSON.stringify({ i, at: `frame-${i}` }));
    }

    logger.info("frames emitted", { frameCount, totalBytes: frameCount * frameKb * 1024 });

    const model = new MockLanguageModelV3({
      doStream: async () => ({
        stream: simulateReadableStream({
          chunkDelayInMs: 5,
          initialDelayInMs: 0,
          chunks: [
            { type: "text-start", id: "t0" },
            {
              type: "text-delta",
              id: "t0",
              delta: `streamed ${frameCount} frames of ${frameKb}KB`,
            },
            { type: "text-end", id: "t0" },
            {
              type: "finish",
              finishReason: { unified: "stop", raw: "stop" },
              usage: {
                inputTokens: { total: 0, noCache: 0, cacheRead: undefined, cacheWrite: undefined },
                outputTokens: { total: 1, text: 1, reasoning: undefined },
              },
            },
          ],
        }),
      }),
    });

    return streamText({ model, messages, abortSignal: signal });
  },
});
