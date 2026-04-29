import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

// DELETE /api/budget/[id]
export async function DELETE(req, { params }) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const budgetId = Number(params.id);

    const budget = await prisma.budget.findUnique({ where: { id: budgetId } });
    if (!budget) return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    if (budget.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.budget.delete({ where: { id: budgetId } });

    return NextResponse.json({ message: "Budget deleted" }, { status: 200 });

  } catch (error) {
    console.error("DELETE /api/budget/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/budget/[id] — update budget amount
export async function PUT(req, { params }) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const budgetId = Number(params.id);
    const { amount } = await req.json();

    const budget = await prisma.budget.findUnique({ where: { id: budgetId } });
    if (!budget) return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    if (budget.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await prisma.budget.update({
      where: { id: budgetId },
      data: { amount: parseFloat(amount) },
      include: { category: true },
    });

    return NextResponse.json({ budget: updated }, { status: 200 });

  } catch (error) {
    console.error("PUT /api/budget/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}