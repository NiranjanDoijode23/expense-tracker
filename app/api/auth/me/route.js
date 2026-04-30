import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { PLANS } from "@/lib/plans"; // ✅ add this

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
        plan: true,           // ✅ include plan
        planExpiry: true,
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
     const planConfig = PLANS[user.plan] || PLANS.free

    return NextResponse.json({ user,planConfig }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
} 