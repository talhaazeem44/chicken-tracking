import "server-only";
import ExcelJS from "exceljs";
import type { LedgerRow } from "@/lib/reports";
import { summarizeLedger } from "@/lib/reports";

export async function buildLedgerWorkbook({
  title,
  rows,
  showSalesPerson,
}: {
  title: string;
  rows: LedgerRow[];
  showSalesPerson: boolean;
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Prime Chicken";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Ledger");

  const columns: Partial<ExcelJS.Column>[] = [
    { header: "Date", key: "date", width: 20 },
    ...(showSalesPerson
      ? [{ header: "Sales Person", key: "salesPerson", width: 18 }]
      : []),
    { header: "Items", key: "item", width: 32 },
    { header: "Shop", key: "shop", width: 22 },
    { header: "Buyer", key: "buyer", width: 18 },
    { header: "Weight (kg)", key: "weight", width: 12 },
    { header: "Blended Rate/kg (Rs)", key: "rate", width: 16 },
    { header: "Amount (Rs)", key: "amount", width: 14 },
    { header: "Received (Rs)", key: "received", width: 14 },
    { header: "Pending (Rs)", key: "pending", width: 14 },
    { header: "Blended Cost/kg (Rs)", key: "cost", width: 16 },
    { header: "Profit/Loss (Rs)", key: "profit", width: 16 },
    { header: "Status", key: "status", width: 12 },
  ];
  sheet.columns = columns;

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF4F4F5" },
  };

  for (const row of rows) {
    sheet.addRow({
      date: row.createdAt,
      salesPerson: showSalesPerson ? row.salesPersonName : undefined,
      item: row.itemsSummary,
      shop: row.shopName,
      buyer: row.buyerName,
      weight: row.weightKg,
      rate: row.ratePerKg,
      amount: row.totalAmount,
      received: row.amountReceived,
      pending: row.amountPending,
      cost: row.costPerKgAtSale,
      profit: row.profit,
      status: row.status,
    });
  }

  sheet.getColumn("date").numFmt = "dd-mmm-yyyy hh:mm";
  for (const key of ["weight", "rate", "amount", "received", "pending", "cost", "profit"]) {
    const col = sheet.getColumn(key);
    col.numFmt = "#,##0.00";
  }

  const summary = summarizeLedger(rows);
  sheet.addRow({});
  const totalsRow = sheet.addRow({
    shop: "TOTAL",
    weight: summary.totalWeightKg,
    amount: summary.totalAmount,
    received: summary.totalReceived,
    pending: summary.totalPending,
    profit: summary.totalProfit,
  });
  totalsRow.font = { bold: true };

  sheet.insertRow(1, [title]);
  sheet.mergeCells(1, 1, 1, columns.length);
  sheet.getRow(1).font = { bold: true, size: 14 };
  sheet.getRow(2).font = { bold: true };
  sheet.getRow(2).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF4F4F5" },
  };

  return workbook.xlsx.writeBuffer();
}
