"use client";
import { PLANS } from "@/lib/plans";

// ✅ Shows free users how much of their limit they've used
// Hidden for premium users

export default function PlanUsageBar({ plan, counts }) {
  if (plan === "premium") return null; // Hide for premium users

  const limits = PLANS.free;

  const items = [
    {
      label: "Expenses",
      used: counts.expenses,
      max: limits.maxExpenses,
      icon: "🧾",
      color: "from-blue-500 to-indigo-500",
    },
    {
      label: "Categories",
      used: counts.categories,
      max: limits.maxCategories,
      icon: "🗂️",
      color: "from-violet-500 to-purple-500",
    },
    {
      label: "Budgets",
      used: counts.budgets,
      max: limits.maxBudgets,
      icon: "🎯",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const getBarColor = (pct) => {
    if (pct >= 100) return "from-red-500 to-rose-500";
    if (pct >= 80) return "from-amber-500 to-orange-500";
    return null; // use item color
  };

  return (
    <div className="glass-card rounded-2xl p-5 mb-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">📈</span>
          <span className="text-[13px] font-semibold text-white/80">Free Plan Usage</span>
        </div>
        <a
          href="/pricing"
          className="text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
        >
          Upgrade to Premium →
        </a>
      </div>

      {/* Usage bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => {
          const pct = Math.min((item.used / item.max) * 100, 100);
          const barColor = getBarColor(pct) || item.color;
          const isMaxed = item.used >= item.max;

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-[12px] text-white/50">{item.label}</span>
                </div>
                <span className={`text-[12px] font-semibold ${isMaxed ? "text-red-400" : "text-white/70"}`}>
                  {item.used}/{item.max}
                </span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {isMaxed && <p className="text-[10px] text-red-400 mt-1">Limit reached</p>}
            </div>
          );
        })}
      </div>

      {/* Locked features note */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5 text-white/35 text-[12px]">
          <span>🔒</span> Analytics
        </div>
        <div className="flex items-center gap-1.5 text-white/35 text-[12px]">
          <span>🔒</span> Export CSV/Excel
        </div>
        <div className="flex items-center gap-1.5 text-white/35 text-[12px]">
          <span>🔒</span> Email reports
        </div>
      </div>
    </div>
  );
}