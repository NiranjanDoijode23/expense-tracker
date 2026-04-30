import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

function monthStartUTC(year, month) {
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
}

function nextMonthStartUTC(year, month) {
  return new Date(Date.UTC(year, month, 1, 0, 0, 0));
}

// GET /api/budget — fetch all budgets with actual spending calculated
export async function GET(req) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all budgets for this user
    const budgets = await prisma.budget.findMany({
      where: { userId: authUser.id },
      include: { category: true },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    if (!budgets.length) {
      return NextResponse.json({ budgets: [] }, { status: 200 });
    }

    const minYear = Math.min(...budgets.map((b) => b.year));
    const minMonth = Math.min(...budgets.filter((b) => b.year === minYear).map((b) => b.month));
    const maxYear = Math.max(...budgets.map((b) => b.year));
    const maxMonth = Math.max(...budgets.filter((b) => b.year === maxYear).map((b) => b.month));

    const allExpenses = await prisma.expense.findMany({
      where: {
        userId: authUser.id,
        date: {
          gte: monthStartUTC(minYear, minMonth),
          lt: nextMonthStartUTC(maxYear, maxMonth),
        },
      },
      select: {
        amount: true,
        date: true,
        categoryId: true,
      },
    });

    const monthlyTotals = {};
    const categoryTotals = {};

    for (const expense of allExpenses) {
      const date = new Date(expense.date);
      const key = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
      monthlyTotals[key] = (monthlyTotals[key] || 0) + expense.amount;

      if (expense.categoryId) {
        const categoryKey = `${key}-${expense.categoryId}`;
        categoryTotals[categoryKey] = (categoryTotals[categoryKey] || 0) + expense.amount;
      }
    }

    const budgetsWithSpending = budgets.map((budget) => {
      const monthKey = `${budget.year}-${budget.month}`;
      const spent = budget.categoryId
        ? (categoryTotals[`${monthKey}-${budget.categoryId}`] || 0)
        : (monthlyTotals[monthKey] || 0);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        ...budget,
        spent: parseFloat(spent.toFixed(2)),
        percentage: parseFloat(percentage.toFixed(1)),
        remaining: parseFloat((budget.amount - spent).toFixed(2)),
      };
    });

    return NextResponse.json({ budgets: budgetsWithSpending }, { status: 200 });

  } catch (error) {
    console.error("GET /api/budget error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/budget — create a new budget
export async function POST(req) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { amount, month, year, categoryId } = await req.json();

    if (!amount || !month || !year) {
      return NextResponse.json({ error: "Amount, month and year are required" }, { status: 400 });
    }

    // Check if budget already exists for this month/year/category combo
    const existing = await prisma.budget.findFirst({
      where: {
        userId: authUser.id,
        month: Number(month),
        year: Number(year),
        categoryId: categoryId ? Number(categoryId) : null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Budget already exists for this month and category" },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        amount: parseFloat(amount),
        month: Number(month),
        year: Number(year),
        userId: authUser.id,
        categoryId: categoryId ? Number(categoryId) : null,
      },
      include: { category: true },
    });

    return NextResponse.json({ budget }, { status: 201 });

  } catch (error) {
    console.error("POST /api/budget error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}