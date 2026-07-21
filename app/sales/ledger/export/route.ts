import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/dal";
import { getLedger, type LedgerPeriod } from "@/lib/reports";
import { buildLedgerWorkbook } from "@/lib/ledger-export";

const VALID_PERIODS: LedgerPeriod[] = ["daily", "weekly", "monthly", "all"];

export async function GET(request: NextRequest) {
  const session = await requireRole("sales");

  const searchParams = request.nextUrl.searchParams;
  const periodParam = searchParams.get("period");
  const period = (VALID_PERIODS.includes(periodParam as LedgerPeriod)
    ? periodParam
    : "all") as LedgerPeriod;

  const rows = await getLedger({ period, salesPersonId: session.userId });

  const buffer = await buildLedgerWorkbook({
    title: `${session.name} — Sales (${period === "all" ? "All Time" : period[0].toUpperCase() + period.slice(1)})`,
    rows,
    showSalesPerson: false,
  });

  const filename = `my-sales-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
