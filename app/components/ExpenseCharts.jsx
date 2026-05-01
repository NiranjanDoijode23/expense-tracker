"use client";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart,
} from "recharts";

// Color palette for pie chart slices
const COLORS = ["#3b82f6", "#8b5cf6", "#f472b6", "#34d399", "#f59e0b", "#ef4444", "#06b6d4", "#a3e635"];

// Custom tooltip style for all charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f111b]/95 backdrop-blur-md border border-[#8b5cf6]/25 rounded-xl px-4 py-2.5 text-sm shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        {label && <p className="text-white/50 text-[11px] mb-1">{label}</p>}
        <p className="text-white font-semibold">₹{Number(payload[0].value || 0).toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

// Custom label for pie chart slices
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null; // hide tiny slices
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ExpenseCharts({ byCategory, byMonth, byDay }) {

  // Don't render charts if no data
  const hasCategory = byCategory?.length > 0;
  const hasMonth    = byMonth?.length > 0;
  const hasDay      = byDay?.length > 0;

  if (!hasCategory && !hasMonth && !hasDay) {
    return (
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-10 text-center">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-white/40 text-sm">Add some expenses to see your analytics</p>
      </div>
    );
  }

  const axisTick = { fill: "rgba(255,255,255,0.45)", fontSize: 11 };
  return (
    <div className="flex flex-col gap-6">

      {/* Row 1 — Pie + Bar side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 🥧 Pie Chart — Spending by Category */}
        <div className="glass-card bg-gradient-to-br from-[#11131f]/90 to-[#171328]/85 border border-[#6366f1]/20 rounded-2xl p-7 hover:border-[#818cf8]/35 transition-colors">
          <h3 className="text-[15px] font-semibold mb-1">Spending by Category</h3>
          <p className="text-white/30 text-[12px] mb-6">Where your money goes</p>

          {hasCategory ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={100}
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-white/25 text-sm">
              No category data yet
            </div>
          )}
        </div>

        {/* 📊 Bar Chart — Monthly Spending */}
        <div className="glass-card bg-gradient-to-br from-[#11131f]/90 to-[#171328]/85 border border-[#6366f1]/20 rounded-2xl p-7 hover:border-[#818cf8]/35 transition-colors">
          <h3 className="text-[15px] font-semibold mb-1">Monthly Spending</h3>
          <p className="text-white/30 text-[12px] mb-6">How much you spend each month</p>

          {hasMonth ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byMonth} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(129,140,248,0.12)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-white/25 text-sm">
              No monthly data yet
            </div>
          )}
        </div>
      </div>

      {/* Row 2 — Line Chart full width */}
      <div className="glass-card bg-gradient-to-br from-[#11131f]/90 to-[#171328]/85 border border-[#6366f1]/20 rounded-2xl p-7 hover:border-[#818cf8]/35 transition-colors">
        <h3 className="text-[15px] font-semibold mb-1">Last 7 Days</h3>
        <p className="text-white/30 text-[12px] mb-6">Your daily spending trend</p>

        {hasDay ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={byDay}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(129,140,248,0.12)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={axisTick}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#areaGradient)"
                dot={{ fill: "#3b82f6", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "#60a5fa" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[220px] text-white/25 text-sm">
            No data for last 7 days
          </div>
        )}
      </div>

    </div>
  );
}