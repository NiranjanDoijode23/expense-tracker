import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextURL } from "next/dist/server/web/next-url";

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


    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "latest";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 5;

    const where = {
      userId,
    }
    const categoryId = Number(category);
    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (from ||to) {
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
      include: { category: true }, // ✅ includes category name
    });

    const total = await prisma.expense.count({ where });
    console.log(where);
  

    return NextResponse.json({ expenses, total, page, totalPages: Math.ceil(total / limit), }, { status: 200 }); // ✅ wrapped in object

  } catch (error) {
    console.error("GET /api/expense error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}