"use client";

import { useActionState, useMemo, useState } from "react";
import { createSale } from "@/lib/actions/sales";
import { ItemPicker } from "@/components/item-picker";
import { formatMoney } from "@/lib/format";

type SellableItem = { id: string; name: string; rate: number; balanceKg: number };
type CartLine = {
  itemId: string;
  itemName: string;
  weightKg: number;
  ratePerKg: number;
};

export function NewSaleForm({ items }: { items: SellableItem[] }) {
  const [state, action, pending] = useActionState(createSale, undefined);

  const [itemId, setItemId] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState("");
  const [rateInput, setRateInput] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [lineError, setLineError] = useState<string | null>(null);

  const selectedItem = items.find((item) => item.id === itemId) ?? null;

  const alreadyInCartKg = useMemo(() => {
    if (!itemId) return 0;
    return cart
      .filter((line) => line.itemId === itemId)
      .reduce((sum, line) => sum + line.weightKg, 0);
  }, [cart, itemId]);

  const remainingForSelected = selectedItem
    ? selectedItem.balanceKg - alreadyInCartKg
    : 0;

  function handleItemChange(id: string | null) {
    setItemId(id);
    setLineError(null);
    const item = items.find((i) => i.id === id);
    setRateInput(item ? String(item.rate) : "");
    setWeightInput("");
  }

  function handleAddLine() {
    setLineError(null);
    if (!selectedItem) {
      setLineError("Choose an item first.");
      return;
    }
    const weightKg = Number(weightInput);
    const ratePerKg = Number(rateInput);
    if (!weightKg || weightKg <= 0) {
      setLineError("Enter a valid weight.");
      return;
    }
    if (!Number.isFinite(ratePerKg) || ratePerKg < 0) {
      setLineError("Enter a valid rate.");
      return;
    }
    if (weightKg > remainingForSelected) {
      setLineError(
        `Only ${remainingForSelected.toFixed(2)}kg of ${selectedItem.name} left.`
      );
      return;
    }

    setCart((prev) => [
      ...prev,
      {
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        weightKg,
        ratePerKg,
      },
    ]);
    setItemId(null);
    setWeightInput("");
    setRateInput("");
  }

  function handleRemoveLine(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  const grandTotal = cart.reduce(
    (sum, line) => sum + line.weightKg * line.ratePerKg,
    0
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="lines" value={JSON.stringify(cart)} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="shopName" className="text-sm font-medium text-zinc-700">
          Shop Name
        </label>
        <input
          id="shopName"
          name="shopName"
          required
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="buyerName" className="text-sm font-medium text-zinc-700">
          Buyer Name
        </label>
        <input
          id="buyerName"
          name="buyerName"
          required
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>

      <div className="rounded-md border border-zinc-200 p-3">
        <p className="mb-2 text-sm font-medium text-zinc-700">Add Item</p>
        <div className="flex flex-col gap-2">
          <ItemPicker
            items={items}
            name="_itemPicker"
            value={itemId}
            onChange={handleItemChange}
            placeholder="Search for an item..."
          />
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Weight (kg)"
              value={weightInput}
              onChange={(event) => setWeightInput(event.target.value)}
              disabled={!selectedItem}
              className="w-1/2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 disabled:bg-zinc-100"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Rate (Rs/kg)"
              value={rateInput}
              onChange={(event) => setRateInput(event.target.value)}
              disabled={!selectedItem}
              className="w-1/2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 disabled:bg-zinc-100"
            />
          </div>
          {selectedItem && (
            <p className="text-xs text-zinc-500">
              {remainingForSelected.toFixed(2)}kg available
            </p>
          )}
          {lineError && <p className="text-sm text-red-600">{lineError}</p>}
          <button
            type="button"
            onClick={handleAddLine}
            disabled={!selectedItem}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50"
          >
            Add to Bill
          </button>
        </div>
        {items.length === 0 && (
          <p className="mt-2 text-xs text-amber-600">
            No items available yet. Ask an admin to add one.
          </p>
        )}
      </div>

      {cart.length > 0 && (
        <div className="rounded-md border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="p-2 font-medium">Item</th>
                <th className="p-2 font-medium">Kg</th>
                <th className="p-2 font-medium">Rate</th>
                <th className="p-2 font-medium">Amount</th>
                <th className="p-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((line, index) => (
                <tr key={index} className="border-b border-zinc-100 last:border-0">
                  <td className="p-2">{line.itemName}</td>
                  <td className="p-2">{line.weightKg.toFixed(2)}</td>
                  <td className="p-2">{formatMoney(line.ratePerKg)}</td>
                  <td className="p-2">
                    {formatMoney(line.weightKg * line.ratePerKg)}
                  </td>
                  <td className="p-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(index)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between border-t border-zinc-200 p-3 text-sm font-semibold text-zinc-900">
            <span>Grand Total</span>
            <span>{formatMoney(grandTotal)}</span>
          </div>
        </div>
      )}

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending || cart.length === 0}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save & Print Bill"}
      </button>
    </form>
  );
}
