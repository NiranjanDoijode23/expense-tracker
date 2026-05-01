import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// GET /api/auth/profile — fetch profile stats
export async function GET(req) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            expenses: true,
            categories: true,
            budgets: true,
          },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Calculate total amount spent
    const spending = await prisma.expense.aggregate({
      where: { userId: authUser.id },
      _sum: { amount: true },
    });
    const totalSpent = spending._sum.amount || 0;

    return NextResponse.json({ user: { ...user, totalSpent } }, { status: 200 });

  } catch (error) {
    console.error("GET /api/auth/profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/auth/profile — update name or password
export async function PUT(req) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, currentPassword, newPassword } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updateData = {};

    // Update name if provided
    if (name !== undefined) {
      updateData.name = name.trim() || null;
    }

    // Update password if provided
    if (newPassword) {
      if (!user.password) {
        return NextResponse.json(
          { error: "This account uses Google sign-in. Set password from register flow first." },
          { status: 400 }
        );
      }
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user: updated, message: "Profile updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("PUT /api/auth/profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}