"use client";

import { useActionState, useMemo, useState } from "react";
import { createSale } from "@/lib/actions/sales";
import { ItemPicker } from "@/components/item-picker";
import { formatMoney } from "@/lib/format";

type SellableItem = { id: string; name: string; rate: number; balanceKg: number };
type PickableBuyer = { id: string; name: string };
type CartLine = {
  itemId: string;
  itemName: string;
  weightKg: number;
  ratePerKg: number;
};

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-base outline-none focus:border-zinc-500 disabled:bg-zinc-100 disabled:text-zinc-400 sm:py-2 sm:text-sm";

export function NewSaleForm({
  items,
  buyers,
}: {
  items: SellableItem[];
  buyers: PickableBuyer[];
}) {
  const [state, action, pending] = useActionState(createSale, undefined);

  const [buyerId, setBuyerId] = useState<string | null>(null);

  const [itemId, setItemId] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState("");
  const [rateInput, setRateInput] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [lineError, setLineError] = useState<string | null>(null);

  const [fullyPaid, setFullyPaid] = useState(true);
  const [amountReceivedInput, setAmountReceivedInput] = useState("");

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
  const amountReceived = fullyPaid
    ? grandTotal
    : Math.max(0, Number(amountReceivedInput) || 0);
  const amountPending = Math.max(0, grandTotal - amountReceived);
  const receivedTooHigh = !fullyPaid && amountReceived > grandTotal;

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="lines" value={JSON.stringify(cart)} />
      <input type="hidden" name="amountReceived" value={amountReceived} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700">Buyer</label>
        <ItemPicker
          items={buyers}
          name="buyerId"
          value={buyerId}
          onChange={setBuyerId}
          placeholder="Search for a buyer..."
        />
        {buyers.length === 0 && (
          <p className="text-xs text-amber-600">
            No buyers available yet. Ask an admin to add one.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-zinc-200 p-3 sm:p-4">
        <p className="mb-3 text-sm font-medium text-zinc-700">Add Item</p>
        <div className="flex flex-col gap-2">
          <ItemPicker
            items={items}
            name="_itemPicker"
            value={itemId}
            onChange={handleItemChange}
            placeholder="Search for an item..."
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Weight (kg)"
              value={weightInput}
              onChange={(event) => setWeightInput(event.target.value)}
              disabled={!selectedItem}
              className={inputClass}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Rate (Rs/kg)"
              value={rateInput}
              onChange={(event) => setRateInput(event.target.value)}
              disabled={!selectedItem}
              className={inputClass}
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
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 sm:py-2"
          >
            + Add to Bill
          </button>
        </div>
        {items.length === 0 && (
          <p className="mt-2 text-xs text-amber-600">
            No items available yet. Ask an admin to add one.
          </p>
        )}
      </div>

      {cart.length > 0 && (
        <div className="rounded-lg border border-zinc-200">
          {/* Table layout for wider screens */}
          <table className="hidden w-full text-left text-sm sm:table">
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

          {/* Stacked cards for narrow screens */}
          <ul className="flex flex-col divide-y divide-zinc-100 sm:hidden">
            {cart.map((line, index) => (
              <li key={index} className="flex items-start justify-between gap-3 p-3">
                <div>
                  <p className="font-medium text-zinc-900">{line.itemName}</p>
                  <p className="text-xs text-zinc-500">
                    {line.weightKg.toFixed(2)}kg &times; {formatMoney(line.ratePerKg)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="font-medium text-zinc-900">
                    {formatMoney(line.weightKg * line.ratePerKg)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveLine(index)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-between border-t border-zinc-200 p-3 text-sm font-semibold text-zinc-900">
            <span>Grand Total</span>
            <span>{formatMoney(grandTotal)}</span>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="rounded-lg border border-zinc-200 p-3 sm:p-4">
          <p className="mb-3 text-sm font-medium text-zinc-700">Payment</p>
          <label className="mb-3 flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={fullyPaid}
              onChange={(event) => setFullyPaid(event.target.checked)}
              className="h-4 w-4"
            />
            Fully paid now
          </label>
          {!fullyPaid && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="amountReceivedInput" className="text-sm font-medium text-zinc-700">
                Amount Received (Rs)
              </label>
              <input
                id="amountReceivedInput"
                type="number"
                step="0.01"
                min="0"
                value={amountReceivedInput}
                onChange={(event) => setAmountReceivedInput(event.target.value)}
                className={inputClass}
              />
              {receivedTooHigh && (
                <p className="text-sm text-red-600">
                  Amount received can&apos;t exceed the bill total.
                </p>
              )}
            </div>
          )}
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-zinc-500">Received</span>
            <span className="font-medium text-zinc-900">
              {formatMoney(amountReceived)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Pending</span>
            <span
              className={`font-medium ${amountPending > 0 ? "text-amber-600" : "text-emerald-600"}`}
            >
              {formatMoney(amountPending)}
            </span>
          </div>
        </div>
      )}

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={
          pending || cart.length === 0 || !buyerId || receivedTooHigh
        }
        className="rounded-md bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 sm:py-2.5"
      >
        {pending ? "Saving..." : "Save & Print Bill"}
      </button>
    </form>
  );
}
