export function formatMoney(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return `Rs ${n.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatKg(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return `${n.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} kg`;
}

export function formatDateTime(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
