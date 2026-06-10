"use client";

import { BackgroundRunsTable } from "@/app/batches/[id]/ClientBatchRunDetails";
import { Card, CardContent } from "@/components/ui/card";
import type { exampleTask } from "@/trigger/example";
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks";

export default function ClientTagRuns({
  tags,
  publicAccessToken,
}: {
  tags: string[];
  publicAccessToken: string;
}) {
  const { runs, error } = useRealtimeRunsWithTag<typeof exampleTask>(
    tags.length === 1 ? tags[0] : tags,
    {
      accessToken: publicAccessToken,
      baseURL: process.env.NEXT_PUBLIC_TRIGGER_API_URL,
    }
  );

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-900 p-4">
        <Card className="w-full bg-gray-800 shadow-md">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 text-gray-200 p-4 space-y-6">
      <h2 className="text-gray-400 text-sm text-center pt-4">
        Runs tagged <span className="font-mono text-gray-200">{tags.join(" + ")}</span>
      </h2>
      <BackgroundRunsTable runs={runs} />
    </div>
  );
}
