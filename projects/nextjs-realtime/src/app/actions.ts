"use server";

import type { exampleTask } from "@/trigger/example";
import type { progressTask, burstTask } from "@/trigger/patterns";
import { auth, tasks } from "@trigger.dev/sdk/v3";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";

export async function triggerExampleTask() {
  const handle = await tasks.trigger<typeof exampleTask>("example", {
    id: randomUUID(),
  });

  // Set JWT in a secure, HTTP-only cookie
  cookies().set("run_token", handle.publicAccessToken);

  // Redirect to the details page
  redirect(`/runs/${handle.id}`);
}

export async function batchTriggerExampleTask() {
  console.log("Batch trigger example task");

  const handle = await tasks.batchTrigger<typeof exampleTask>("example", [
    { payload: { id: randomUUID() } },
    { payload: { id: randomUUID() } },
    { payload: { id: randomUUID() } },
    { payload: { id: randomUUID() } },
    { payload: { id: randomUUID() } },
    { payload: { id: randomUUID() } },
    { payload: { id: randomUUID() } },
    { payload: { id: randomUUID() } },
  ]);

  console.log("Setting the run JWT in a cookie", handle.publicAccessToken);

  // Set JWT in a secure, HTTP-only cookie
  cookies().set("run_token", handle.publicAccessToken);

  // Redirect to the details page
  redirect(`/batches/${handle.batchId}`);
}

export async function triggerProgressTask() {
  const handle = await tasks.trigger<typeof progressTask>("progress", {
    steps: 20,
    intervalMs: 750,
  });

  cookies().set("run_token", handle.publicAccessToken);
  redirect(`/runs/${handle.id}`);
}

export async function triggerBurstTask() {
  const handle = await tasks.trigger<typeof burstTask>("burst", { bursts: 10, intervalMs: 150 });

  cookies().set("run_token", handle.publicAccessToken);
  redirect(`/runs/${handle.id}`);
}

export async function triggerTaggedRuns() {
  const tag = `demo:${randomUUID().slice(0, 8)}`;

  await tasks.batchTrigger<typeof exampleTask>(
    "example",
    [1, 2, 3].map(() => ({ payload: { id: randomUUID() }, options: { tags: [tag] } }))
  );

  const publicAccessToken = await auth.createPublicToken({
    scopes: { read: { tags: tag } },
  });

  redirect(`/tags/${encodeURIComponent(tag)}?publicAccessToken=${publicAccessToken}`);
}
