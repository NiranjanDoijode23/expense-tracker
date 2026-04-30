// app/api/admin/set-plan/route.js
// ⚠️ TEMPORARY — for testing premium features without Razorpay
// Remove or secure this before going to production!

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { email, plan, adminSecret } = await req.json();

    // ✅ Basic protection — only allow with secret key
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!["free", "premium"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email },
      data: {
        plan,
        planExpiry: plan === "premium"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          : null,
      },
      select: { id: true, email: true, plan: true, planExpiry: true },
    });

    return NextResponse.json({
      message: `User ${email} upgraded to ${plan}`,
      user,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}