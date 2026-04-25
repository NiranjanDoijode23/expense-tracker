import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function DELETE(req, { params }) {
  try {
    const resparams =await params;
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const expenseId = Number(resparams.id);


    // Check if expense exists
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Check if expense belongs to logged in user
    if (expense.userId !== userId) {
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
    const resparams = await params;
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    
    const expenseId = Number(resparams.id);

    // ✅ Also destructure categoryId and date
    const { amount, note, categoryId, date } = await req.json();

    const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!expense || expense.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        amount: parseFloat(amount),
        note: note || null,
        categoryId: categoryId ? Number(categoryId) : null, // ✅ added
        date: date ? new Date(date) : expense.date,         // ✅ added
      },
    });

    // ✅ Wrap in { expense } so frontend can read data.expense
    return NextResponse.json({ expense: updated }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}