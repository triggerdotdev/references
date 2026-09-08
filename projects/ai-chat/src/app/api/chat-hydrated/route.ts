/**
 * chat.headStart first-turn endpoint for the `ai-chat-hydrated` agent.
 *
 * Same shape as `/api/chat` (see the header comment there for the
 * full head-start mechanics) but handing over to the hydrateMessages
 * agent. This is the smoke-test surface for the headStart ×
 * hydrateMessages combination: the agent owns history via its DB-backed
 * `hydrateMessages` hook, and the turn-0 handover splice must still
 * deliver the warm handler's step-1 partial (text, tool calls, stable
 * messageId) into the agent's accumulator.
 */
import { chat } from "@trigger.dev/sdk/chat-server";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
// ⚠️ Imports MUST come from `chat-tools-schemas` only — see the
// header comment in that file for the bundle-isolation rationale.
import { headStartTools } from "@/lib/chat-tools-schemas";

export const POST = chat.headStart({
  agentId: "ai-chat-hydrated",
  run: async ({ chat: chatHelper }) => {
    return streamText({
      ...chatHelper.toStreamTextOptions({ tools: headStartTools }),
      model: anthropic("claude-sonnet-4-6"),
      system:
        "You are a helpful AI assistant. Be concise and friendly. Use the available tools when relevant.",
      // Extended thinking so head-start smoke tests cover reasoning
      // parts surviving the handover into durable history.
      providerOptions: {
        anthropic: { thinking: { type: "enabled", budgetTokens: 2048 } },
      },
    });
  },
});
