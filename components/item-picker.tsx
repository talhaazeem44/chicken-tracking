"use client";

import { useEffect, useRef, useState } from "react";

export type PickableItem = { id: string; name: string };

export function ItemPicker({
  items,
  name,
  value,
  onChange,
  placeholder = "Search items...",
  disabled,
}: {
  items: PickableItem[];
  name: string;
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const selected = items.find((item) => item.id === value) ?? null;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // While closed, show the selected item's name; while open, show whatever
  // the user is typing to search. This avoids syncing local state to the
  // `value` prop via an effect.
  const displayValue = open ? query : (selected?.name ?? "");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value ?? ""} />
      <input
        type="text"
        value={displayValue}
        disabled={disabled}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          if (value !== null) onChange(null);
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 disabled:bg-zinc-100 disabled:text-zinc-400"
      />
      {open && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-zinc-200 bg-white text-sm shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-zinc-500">No items found.</li>
          ) : (
            filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    setQuery(item.name);
                    setOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left hover:bg-zinc-100"
                >
                  {item.name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
