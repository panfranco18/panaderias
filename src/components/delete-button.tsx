"use client";

import { useActionState } from "react";
import { IconTrash } from "@/components/admin-icons";

type ActionState = { error?: string; ok?: boolean };

const initialState: ActionState = {};

export function DeleteButton({
  action,
  label = "Eliminar",
}: {
  action: () => Promise<ActionState>;
  label?: string;
}) {
  const [state, formAction, pending] = useActionState(
    async () => action(),
    initialState
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          aria-label={label}
          className="rounded-md p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-red-950"
        >
          <IconTrash className="h-4 w-4" />
        </button>
      </form>
      {state.error && (
        <p className="max-w-40 text-right text-xs text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </div>
  );
}
