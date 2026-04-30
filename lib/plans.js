// app/lib/plans.js
// Single source of truth for all plan limits
// When you add Razorpay later, just change plan in DB — everything updates automatically

export const PLANS = {
  free: {
    name: "Free",
    maxExpenses: 50,
    maxCategories: 5,
    maxBudgets: 3,
    export: false,
    analytics: false,
  },
  premium: {
    name: "Premium",
    maxExpenses: Infinity,
    maxCategories: Infinity,
    maxBudgets: Infinity,
    export: true,
    analytics: true,
  },
};

// ✅ Helper — get plan config for a user
export const getUserPlan = (plan) => PLANS[plan] || PLANS.free;

// ✅ Helper — check if user can do something
export const canDo = (plan, feature) => {
  const config = getUserPlan(plan);
  return config[feature] === true || config[feature] === Infinity;
};

// ✅ Helper — check if user is within limit
export const withinLimit = (plan, feature, currentCount) => {
  const config = getUserPlan(plan);
  const limit = config[feature];
  if (limit === Infinity) return true;
  return currentCount < limit;
};