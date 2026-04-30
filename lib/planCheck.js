// app/lib/planCheck.js
// Used in API routes to check plan limits before allowing actions

import prisma from "@/lib/prisma";
import { PLANS } from "@/lib/plans";

// ✅ Get user with plan from DB using userId
export async function getUserWithPlan(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      planExpiry: true,
      _count: {
        select: {
          expenses: true,
          categories: true,
          budgets: true,
        },
      },
    },
  });
  return user;
}

// ✅ Check if user can add more expenses
export async function canAddExpense(userId) {
  const user = await getUserWithPlan(userId);
  const limit = PLANS[user.plan]?.maxExpenses ?? PLANS.free.maxExpenses;

  if (limit === Infinity) return { allowed: true };

  if (user._count.expenses >= limit) {
    return {
      allowed: false,
      message: `Free plan limit reached. You can only add ${limit} expenses. Upgrade to Premium for unlimited expenses.`,
      current: user._count.expenses,
      limit,
    };
  }

  return { allowed: true, current: user._count.expenses, limit };
}

// ✅ Check if user can add more categories
export async function canAddCategory(userId) {
  const user = await getUserWithPlan(userId);
  const limit = PLANS[user.plan]?.maxCategories ?? PLANS.free.maxCategories;

  if (limit === Infinity) return { allowed: true };

  if (user._count.categories >= limit) {
    return {
      allowed: false,
      message: `Free plan limit reached. You can only have ${limit} categories. Upgrade to Premium for unlimited categories.`,
      current: user._count.categories,
      limit,
    };
  }

  return { allowed: true, current: user._count.categories, limit };
}

// ✅ Check if user can add more budgets
export async function canAddBudget(userId) {
  const user = await getUserWithPlan(userId);
  const limit = PLANS[user.plan]?.maxBudgets ?? PLANS.free.maxBudgets;

  if (limit === Infinity) return { allowed: true };

  if (user._count.budgets >= limit) {
    return {
      allowed: false,
      message: `Free plan limit reached. You can only have ${limit} budgets. Upgrade to Premium for unlimited budgets.`,
      current: user._count.budgets,
      limit,
    };
  }

  return { allowed: true, current: user._count.budgets, limit };
}

// ✅ Check if user can export
export async function canExport(userId) {
  const user = await getUserWithPlan(userId);
  const allowed = PLANS[user.plan]?.export ?? false;

  if (!allowed) {
    return {
      allowed: false,
      message: "Export is a Premium feature. Upgrade to Premium to export your expenses.",
    };
  }

  return { allowed: true };
}

// ✅ Check if user can view analytics
export async function canViewAnalytics(userId) {
  const user = await getUserWithPlan(userId);
  const allowed = PLANS[user.plan]?.analytics ?? false;

  if (!allowed) {
    return {
      allowed: false,
      message: "Analytics is a Premium feature. Upgrade to Premium to view your spending insights.",
    };
  }

  return { allowed: true };
}