import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { canAddCategory } from "@/lib/planCheck"; // ✅ add this


// GET /api/category — fetch all categories of logged in user
export async function GET(req) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      where: { userId: authUser.id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/category — create a new category
export async function POST(req) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const check = await canAddCategory(authUser.id);
    if (!check.allowed) {
      return NextResponse.json(
        { error: check.message, limitReached: true, limit: check.limit },
        { status: 403 }
      );
    }

    const { name } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    // Check if category already exists for this user
    const existing = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        userId: authUser.id,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        userId: authUser.id,
      },
    });

    return NextResponse.json({ category }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}