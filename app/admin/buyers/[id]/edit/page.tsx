import Link from "next/link";
import { notFound } from "next/navigation";
import { getBuyerById } from "@/lib/buyers";
import { EditBuyerForm } from "./edit-buyer-form";

export default async function EditBuyerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const buyer = await getBuyerById(id);

  if (!buyer) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/admin/buyers/${buyer.id}`}
          className="text-sm font-medium text-zinc-600 hover:underline"
        >
          ← Back to {buyer.name}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900">
          Edit {buyer.name}
        </h1>
        <p className="text-sm text-zinc-500">
          Update their name, shop, phone, or address.
        </p>
      </div>

      <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-6">
        <EditBuyerForm
          buyerId={buyer.id}
          defaultName={buyer.name}
          defaultShopName={buyer.shopName}
          defaultPhone={buyer.phone}
          defaultAddress={buyer.address}
        />
      </div>
    </div>
  );
}
