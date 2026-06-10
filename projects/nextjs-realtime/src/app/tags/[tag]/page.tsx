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

  return (
    <ClientTagRuns tag={decodeURIComponent(params.tag)} publicAccessToken={publicAccessToken} />
  );
}
