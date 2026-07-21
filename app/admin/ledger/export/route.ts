import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/dal";
import { getBuyerById } from "@/lib/buyers";
import { getLedger, type LedgerPeriod } from "@/lib/reports";
import { buildLedgerWorkbook } from "@/lib/ledger-export";

const VALID_PERIODS: LedgerPeriod[] = ["daily", "weekly", "monthly", "all"];

export async function GET(request: NextRequest) {
  await requireRole("admin");

  const searchParams = request.nextUrl.searchParams;
  const periodParam = searchParams.get("period");
  const period = (VALID_PERIODS.includes(periodParam as LedgerPeriod)
    ? periodParam
    : "all") as LedgerPeriod;
  const salesPersonId = searchParams.get("salesPersonId") ?? undefined;
  const buyerId = searchParams.get("buyerId") ?? undefined;
  const buyer = buyerId ? await getBuyerById(buyerId) : null;

  const rows = await getLedger({ period, salesPersonId, buyerId });

  const periodLabel = period === "all" ? "All Time" : period[0].toUpperCase() + period.slice(1);
  const title = buyer
    ? `${buyer.name} — Ledger (${periodLabel})`
    : `Poultry Chicken — Ledger (${periodLabel})`;

  const buffer = await buildLedgerWorkbook({
    title,
    rows,
    showSalesPerson: true,
  });

  const filenamePrefix = buyer
    ? `buyer-${buyer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    : "poultry-chicken-ledger";
  const filename = `${filenamePrefix}-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
