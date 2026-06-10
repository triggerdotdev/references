import { notFound } from "next/navigation";
import ClientTagRuns from "./ClientTagRuns";

export default function TagRunsPage({
  params,
  searchParams,
}: {
  params: { tag: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const publicAccessToken = searchParams.publicAccessToken;

  if (typeof publicAccessToken !== "string") {
    notFound();
  }

  // Comma-separated tags subscribe with multiple tags (runs must carry ALL of them).
  const tags = decodeURIComponent(params.tag).split(",");

  return <ClientTagRuns tags={tags} publicAccessToken={publicAccessToken} />;
}
