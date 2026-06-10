"use client";

// @ts-ignore
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="p-0 bg-transparent hover:bg-transparent hover:text-gray-200 text-gray-400"
    >
      {pending ? "Running..." : label}
    </Button>
  );
}

export default function TaskActionButton({
  action,
  label,
}: {
  action: () => Promise<void>;
  label: string;
}) {
  return (
    <form action={action}>
      <SubmitButton label={label} />
    </form>
  );
}
