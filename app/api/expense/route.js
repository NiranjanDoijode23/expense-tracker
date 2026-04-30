import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { canAddExpense } from "@/lib/planCheck"; // ✅ add this

function parseDateInput(dateValue) {
  if (!dateValue) return new Date();
  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const [year, month, day] = dateValue.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  }
  return new Date(dateValue);
}

export async function POST(req) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Check plan limit before adding
    const check = await canAddExpense(authUser.id);
    if (!check.allowed) {
      return NextResponse.json(
        { error: check.message, limitReached: true, limit: check.limit },
        { status: 403 }
      );
    }


    const { amount, categoryId, note, date } = await req.json();
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        note: note || null,
        categoryId: categoryId ? Number(categoryId) : null,
        date: parseDateInput(date),
        userId: authUser.id,
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
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "latest";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 5;

    const where = {
      userId: authUser.id,
    }
    const categoryId = Number(category);
    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    if (search) {
      where.note = {
        contains: search,
      }
    }

    // SORTING
    let orderBy = {};
    if (sort === "latest") orderBy.date = "desc";
    if (sort === "oldest") orderBy.date = "asc";
    if (sort === "amount_high") orderBy.amount = "desc";
    if (sort === "amount_low") orderBy.amount = "asc";

    // PAGINATION
    const skip = (page - 1) * limit;


    const expenses = await prisma.expense.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { category: { select: { id: true, name: true } } },
    });

    const total = await prisma.expense.count({ where });


    return NextResponse.json({ expenses, total, page, totalPages: Math.ceil(total / limit), }, { status: 200 }); // ✅ wrapped in object

  } catch (error) {
    console.error("GET /api/expense error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}