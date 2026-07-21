import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemById } from "@/lib/items";
import { EditItemForm } from "./edit-item-form";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/items"
          className="text-sm font-medium text-zinc-600 hover:underline"
        >
          ← Back to Items
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900">
          Edit {item.name}
        </h1>
        <p className="text-sm text-zinc-500">
          Update the name, description, or rate.
        </p>
      </div>

      <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-6">
        <EditItemForm
          itemId={item.id}
          defaultName={item.name}
          defaultDescription={item.description}
          defaultRate={item.rate}
        />
      </div>
    </div>
  );
}
