import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { canViewAnalytics } from "@/lib/planCheck"; // ✅ add this


export async function GET(req) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const check = await canViewAnalytics(authUser.id);
    if (!check.allowed) {
      return NextResponse.json(
        { error: check.message, limitReached: true },
        { status: 403 }
      );
    }

    // Fetch all expenses with category
    const expenses = await prisma.expense.findMany({
      where: { userId: authUser.id },
      include: { category: true },
      orderBy: { date: "asc" },
    });

    // 1. Group by category → for Pie chart
    const categoryMap = {};
    expenses.forEach((e) => {
      const name = e.category?.name || "Uncategorized";
      categoryMap[name] = (categoryMap[name] || 0) + e.amount;
    });
    const byCategory = Object.entries(categoryMap).map(([name, total]) => ({
      name,
      total: parseFloat(total.toFixed(2)),
    }));

    // 2. Group by month → for Bar chart
    const monthMap = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    expenses.forEach((e) => {
      const d = new Date(e.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthMap[key] = (monthMap[key] || 0) + e.amount;
    });
    const byMonth = Object.entries(monthMap).map(([month, total]) => ({
      month,
      total: parseFloat(total.toFixed(2)),
    }));

    // 3. Group by day (last 7 days) → for Line chart
    const dayMap = {};
    const last7 = new Date();
    last7.setDate(last7.getDate() - 6);
    expenses
      .filter((e) => new Date(e.date) >= last7)
      .forEach((e) => {
        const key = new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        dayMap[key] = (dayMap[key] || 0) + e.amount;
      });
    const byDay = Object.entries(dayMap).map(([date, total]) => ({
      date,
      total: parseFloat(total.toFixed(2)),
    }));

    return NextResponse.json({ byCategory, byMonth, byDay }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}