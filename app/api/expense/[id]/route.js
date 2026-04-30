import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

function parseDateInput(dateValue) {
  if (!dateValue) return null;
  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const [year, month, day] = dateValue.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  }
  return new Date(dateValue);
}

export async function DELETE(req, { params }) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const resolvedParams = await Promise.resolve(params);
    const expenseId = Number(resolvedParams?.id);
    if (!Number.isInteger(expenseId)) {
      return NextResponse.json({ error: "Invalid expense id" }, { status: 400 });
    }


    // Check if expense exists
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Check if expense belongs to logged in user
    if (expense.userId !== authUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete
    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("DELETE /api/expense/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function PUT(req, { params }) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const resolvedParams = await Promise.resolve(params);
    const expenseId = Number(resolvedParams?.id);
    if (!Number.isInteger(expenseId)) {
      return NextResponse.json({ error: "Invalid expense id" }, { status: 400 });
    }

    // ✅ Also destructure categoryId and date
    const { amount, note, categoryId, date } = await req.json();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!expense || expense.userId !== authUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        amount: parsedAmount,
        note: note || null,
        categoryId: categoryId ? Number(categoryId) : null, // ✅ added
        date: parseDateInput(date) || expense.date,         // ✅ added
      },
    });

    // ✅ Wrap in { expense } so frontend can read data.expense
    return NextResponse.json({ expense: updated }, { status: 200 });

  } catch (error) {
    console.error("PUT /api/expense/[id] error:", error);
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}