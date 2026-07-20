"use client";

import { useActionState, useRef, useEffect } from "react";
import { createSalesUser } from "@/lib/actions/users";

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createSalesUser, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name"className="text-sm font-medium text-zinc-700">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username"className="text-sm font-medium text-zinc-700">
          Username
        </label>
        <input
          id="username"
          name="username"
          required
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password"className="text-sm font-medium text-zinc-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-600">{state.success}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create Sales Account"}
      </button>
    </form>
  );
}
