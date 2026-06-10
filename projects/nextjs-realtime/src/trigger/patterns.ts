import { metadata, schemaTask } from "@trigger.dev/sdk/v3";
import { setTimeout } from "timers/promises";
import { z } from "zod";

/** Long-running steady progress: good for watching live updates, refreshes, and multi-tab. */
export const progressTask = schemaTask({
  id: "progress",
  schema: z.object({
    steps: z.number().int().min(1).max(100).default(20),
    intervalMs: z.number().int().min(100).max(5_000).default(750),
  }),
  run: async ({ steps, intervalMs }) => {
    for (let i = 1; i <= steps; i++) {
      metadata.set("status", {
        type: i < steps ? "processing" : "finished",
        progress: i / steps,
        step: i,
        steps,
      });
      await setTimeout(intervalMs);
    }
    return { steps };
  },
});

/**
 * Rapid metadata burst then immediate completion: recreates the change-lands-between-polls
 * scenario deterministically (the final write happens right on the heels of earlier ones).
 */
export const burstTask = schemaTask({
  id: "burst",
  schema: z.object({
    bursts: z.number().int().min(1).max(50).default(10),
    intervalMs: z.number().int().min(0).max(1_000).default(150),
    // Lets a watching page settle into a held live poll before the burst lands.
    delayMs: z.number().int().min(0).max(30_000).default(5_000),
  }),
  run: async ({ bursts, intervalMs, delayMs }) => {
    metadata.set("status", { type: "started", progress: 0 });
    if (delayMs > 0) await setTimeout(delayMs);
    for (let i = 1; i <= bursts; i++) {
      metadata.set("status", { type: "processing", progress: i / (bursts + 1), burst: i });
      if (intervalMs > 0) await setTimeout(intervalMs);
    }
    metadata.set("status", { type: "finished", progress: 1 });
    return { bursts };
  },
});
