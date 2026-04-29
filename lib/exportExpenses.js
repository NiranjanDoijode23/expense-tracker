// app/lib/exportExpenses.js
// Utility to export expenses as CSV or Excel (.xlsx)
// Uses the 'xlsx' library — run: npm install xlsx

import * as XLSX from "xlsx";

// Format date nicely
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Convert expenses array to rows for export
const buildRows = (expenses) => {
  const rows = expenses.map((e, i) => ({
    "#": i + 1,
    Date: formatDate(e.date),
    Note: e.note || "No note",
    Category: e.category?.name || "Uncategorized",
    "Amount (₹)": e.amount,
  }));

  // Add total row at the bottom
  const total = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  rows.push({
    "#": "",
    Date: "",
    Note: "",
    Category: "TOTAL",
    "Amount (₹)": parseFloat(total.toFixed(2)),
  });

  return rows;
};

// ── Export as CSV ──────────────────────────────────────────
export const exportCSV = (expenses, filename = "expenses") => {
  const rows = buildRows(expenses);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();

  URL.revokeObjectURL(url);
};

// ── Export as Excel (.xlsx) ────────────────────────────────
export const exportExcel = (expenses, filename = "expenses") => {
  const rows = buildRows(expenses);

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  // Set column widths
  worksheet["!cols"] = [
    { wch: 5  }, // #
    { wch: 14 }, // Date
    { wch: 28 }, // Note
    { wch: 16 }, // Category
    { wch: 12 }, // Amount
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
};