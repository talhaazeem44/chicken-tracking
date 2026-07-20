import Link from "next/link";
import { notFound } from "next/navigation";
import { getSalesUserById } from "@/lib/reports";
import { EditUserForm } from "./edit-user-form";

export default async function EditSalesUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSalesUserById(Number(id));

  if (!user) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/users"
          className="text-sm font-medium text-zinc-600 hover:underline"
        >
          ← Back to Sales Team
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900">
          Edit {user.name}
        </h1>
        <p className="text-sm text-zinc-500">
          Update their name, username, or reset their password.
        </p>
      </div>

      <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-6">
        <EditUserForm
          userId={user.id}
          defaultName={user.name}
          defaultUsername={user.username}
        />
      </div>
    </div>
  );
}
