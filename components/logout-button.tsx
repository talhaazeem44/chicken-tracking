import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
      >
        Sign out
      </button>
    </form>
  );
}
