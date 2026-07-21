import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/dal";
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
  const salesPersonIdParam = searchParams.get("salesPersonId");
  const salesPersonId = salesPersonIdParam
    ? Number(salesPersonIdParam)
    : undefined;

  const rows = await getLedger({ period, salesPersonId });

  const buffer = await buildLedgerWorkbook({
    title: `Poultry Chicken — Ledger (${period === "all" ? "All Time" : period[0].toUpperCase() + period.slice(1)})`,
    rows,
    showSalesPerson: true,
  });

  const filename = `poultry-chicken-ledger-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
