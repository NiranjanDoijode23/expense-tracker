import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value; // ✅ fixed - no destructuring

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { amount, categoryId, note, date } = await req.json();

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        note: note || null,
        categoryId: categoryId ? Number(categoryId) : null,
        date: date ? new Date(date) : new Date(),
        userId,
      },
    });

    return NextResponse.json({ expense }, { status: 201 });

  } catch (error) {
    console.error("POST /api/expense error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const expenses = await prisma.expense.findMany({
      where: { userId },
      include: { category: true }, // ✅ includes category name
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ expenses }, { status: 200 }); // ✅ wrapped in object

  } catch (error) {
    console.error("GET /api/expense error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}