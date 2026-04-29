import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

// GET /api/budget — fetch all budgets with actual spending calculated
export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Fetch all budgets for this user
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    // For each budget, calculate actual spending
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        // Build date range for this budget's month/year
        const startDate = new Date(budget.year, budget.month - 1, 1);
        const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

        // Build expense query
        const whereClause = {
          userId,
          date: { gte: startDate, lte: endDate },
        };

        // If budget has a category → filter by category
        // If no category → overall monthly budget (all expenses)
        if (budget.categoryId) {
          whereClause.categoryId = budget.categoryId;
        }

        const expenses = await prisma.expense.findMany({ where: whereClause });
        const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        return {
          ...budget,
          spent: parseFloat(spent.toFixed(2)),
          percentage: parseFloat(percentage.toFixed(1)),
          remaining: parseFloat((budget.amount - spent).toFixed(2)),
        };
      })
    );

    return NextResponse.json({ budgets: budgetsWithSpending }, { status: 200 });

  } catch (error) {
    console.error("GET /api/budget error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/budget — create a new budget
export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { amount, month, year, categoryId } = await req.json();

    if (!amount || !month || !year) {
      return NextResponse.json({ error: "Amount, month and year are required" }, { status: 400 });
    }

    // Check if budget already exists for this month/year/category combo
    const existing = await prisma.budget.findFirst({
      where: {
        userId,
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
        userId,
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