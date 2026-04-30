"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ExpenseCharts from "../components/ExpenseCharts";
import { exportCSV, exportExcel } from "@/lib/exportExpenses"; // ✅ import export utils
import ThemeToggle from "../components/ThemeToggle";
import toast from "react-hot-toast"; // ✅ add this
import { signOut } from "next-auth/react";
import UpgradePrompt from "../components/UpgradePrompt";
import PlanUsageBar from "../components/PlanUsageBar";
import { PLANS } from "@/lib/plans";



const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getLocalDateInputValue(dateValue) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DashboardPage() {
  const [upgradePrompt, setUpgradePrompt] = useState(null);
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]); // ✅ unfiltered — used for export
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState("expenses");
  const [exporting, setExporting] = useState(false); // ✅ export loading state
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: "expense"|"budget", id, name }



  // Edit expense state
  const [editingExpense, setEditingExpense] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // Budget form state
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetMonth, setBudgetMonth] = useState(new Date().getMonth() + 1);
  const [budgetYear, setBudgetYear] = useState(new Date().getFullYear());
  const [budgetCategoryId, setBudgetCategoryId] = useState("");
  const [addingBudget, setAddingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState("");
  const [deletingBudgetId, setDeletingBudgetId] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & pagination
  const [filters, setFilters] = useState({
    category: "", from: "", to: "", search: "", sort: "latest", page: 1,
  });

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const query = new URLSearchParams({ ...filters }).toString();

      const [userRes, expenseRes, allExpenseRes, catRes, analyticsRes, budgetRes] = await Promise.all([
        fetch("/api/auth/me", { credentials: "include" }),
        fetch(`/api/expense?${query}`, { credentials: "include" }),
        fetch("/api/expense", { credentials: "include" }), // ✅ all expenses for export (no filters)
        fetch("/api/category", { credentials: "include" }),
        fetch("/api/expense/analytics", { credentials: "include" }),
        fetch("/api/budget", { credentials: "include" }),
      ]);

      if (userRes.status === 401) {
        router.push("/login");
        return;
      }

      const [userData, expData, allExpData, catData, analyticsData, budgetData] = await Promise.all([
        userRes.json(),
        expenseRes.ok ? expenseRes.json() : { expenses: [] },
        allExpenseRes.ok ? allExpenseRes.json() : { expenses: [] }, // ✅
        catRes.ok ? catRes.json() : { categories: [] },
        analyticsRes.ok ? analyticsRes.json() : null,
        budgetRes.ok ? budgetRes.json() : { budgets: [] },
      ]);

      setUser(userData.user || null);
      setExpenses(expData.expenses || []);
      setAllExpenses(allExpData.expenses || []); // ✅
      setTotalPages(expData.totalPages || 1);
      setCategories(catData.categories || []);
      setAnalytics(analyticsData);
      setBudgets(budgetData.budgets || []);
      setLoading(false);
    };
    init();
  }, [filters, router]);

  const refreshAnalytics = async () => {
    const ar = await fetch("/api/expense/analytics", { credentials: "include" });
    if (ar.ok) setAnalytics(await ar.json());
  };

  const refreshBudgets = async () => {
    const br = await fetch("/api/budget", { credentials: "include" });
    if (br.ok) { const d = await br.json(); setBudgets(d.budgets || []); }
  };

  // ✅ Handle CSV export
  const handleExportCSV = async () => {
    if (user?.plan !== "premium") {
      setUpgradePrompt({
        message: "Export is a Premium feature. Upgrade to download your expenses as CSV.",
        feature: "export",
      });
      return;
    }
    setExporting(true);
    try {
      exportCSV(allExpenses, `expensetrack_${user?.email?.split("@")[0]}`);
    } finally {
      setExporting(false);
    }
  };

  // ✅ Handle Excel export
  const handleExportExcel = async () => {
    if (user?.plan !== "premium") {
      setUpgradePrompt({
        message: "Export is a Premium feature. Upgrade to download your expenses as Excel.",
        feature: "export",
      });
      return;
    }
    setExporting(true);
    try {
      exportExcel(allExpenses, `expensetrack_${user?.email?.split("@")[0]}`);
    } finally {
      setExporting(false);
    }
  };



  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await signOut({ redirect: false });
    router.push("/login");
  };

  const handleDelete = (expense) => {
    setConfirmDelete({
      type: "expense",
      id: expense.id,
      name: expense.note || "this expense",
    });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;

    if (confirmDelete.type === "expense") {
      setDeletingId(confirmDelete.id);
      const res = await fetch(`/api/expense/${confirmDelete.id}`, {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) {
        setExpenses((prev) => prev.filter((e) => e.id !== confirmDelete.id));
        setAllExpenses((prev) => prev.filter((e) => e.id !== confirmDelete.id));
        refreshAnalytics();
        refreshBudgets();
        toast.success("Expense deleted");
      } else {
        toast.error("Failed to delete expense");
      }
      setDeletingId(null);
    }

    if (confirmDelete.type === "budget") {
      setDeletingBudgetId(confirmDelete.id);
      const res = await fetch(`/api/budget/${confirmDelete.id}`, {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) {
        setBudgets((prev) => prev.filter((b) => b.id !== confirmDelete.id));
        toast.success("Budget deleted");
      } else {
        toast.error("Failed to delete budget");
      }
      setDeletingBudgetId(null);
    }

    setConfirmDelete(null);
  };


  // const handleDelete = async (id) => {
  //   setDeletingId(id);
  //   const res = await fetch(`/api/expense/${id}`, { method: "DELETE", credentials: "include" });
  //   if (res.ok) {
  //     setExpenses((prev) => prev.filter((e) => e.id !== id));
  //     setAllExpenses((prev) => prev.filter((e) => e.id !== id)); // ✅ also remove from allExpenses
  //     refreshAnalytics();
  //     refreshBudgets();
  //     toast.success("Expense deleted");
  //   }
  //   else {
  //     toast.error("Failed to delete expense");
  //   }
  //   setDeletingId(null);
  // };

  const openEdit = (expense) => {
    setEditingExpense(expense);
    setEditAmount(expense.amount.toString());
    setEditNote(expense.note || "");
    setEditCategoryId(expense.categoryId ? String(expense.categoryId) : "");
    setEditDate(getLocalDateInputValue(expense.date));
    setEditError("");
  };

  const closeEdit = () => { setEditingExpense(null); setEditError(""); };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setEditError("");

    const res = await fetch(`/api/expense/${editingExpense.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        amount: parseFloat(editAmount),
        note: editNote,
        categoryId: editCategoryId || null,
        date: editDate,
      }),
    });

    const data = await res.json();
    setUpdating(false);

    if (!res.ok) { toast.error(data.error || "Failed to update expense"); return; }

    const updatedFields = {
      ...editingExpense,
      amount: parseFloat(editAmount),
      note: editNote || null,
      date: editDate,
      categoryId: editCategoryId ? Number(editCategoryId) : null,
      category: categories.find((c) => String(c.id) === editCategoryId) || null,
    };

    setExpenses((prev) => prev.map((exp) => exp.id === editingExpense.id ? updatedFields : exp));
    setAllExpenses((prev) => prev.map((exp) => exp.id === editingExpense.id ? updatedFields : exp)); // ✅
    refreshAnalytics();
    refreshBudgets();
    toast.success("Expense updated!");
    closeEdit();


  };

// AFTER — updated with plan check
const handleAddBudget = async (e) => {
  e.preventDefault();
  setAddingBudget(true);
  setBudgetError("");

  const res = await fetch("/api/budget", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      amount: parseFloat(budgetAmount),
      month: Number(budgetMonth),
      year: Number(budgetYear),
      categoryId: budgetCategoryId || null,
    }),
  });

  const data = await res.json();
  setAddingBudget(false);

  if (!res.ok) {
    // ✅ NEW — if free user hit budget limit, show upgrade popup
    if (res.status === 403 && data.limitReached) {
      setUpgradePrompt({
        message: data.error,
        feature: "budgets",
      });
      return;
    }
    // for any other error, show toast
    toast.error(data.error || "Failed to add budget");
    return;
  }

  toast.success("Budget set! 🎯");
  setBudgetAmount("");
  setBudgetCategoryId("");
  refreshBudgets();
};


  const handleDeleteBudget = (budget) => {
    setConfirmDelete({
      type: "budget",
      id: budget.id,
      name: `${budget.category?.name || "Overall"} budget`,
    });
  };




  // const handleDeleteBudget = async (id) => {
  //   setDeletingBudgetId(id);
  //   const res = await fetch(`/api/budget/${id}`, { method: "DELETE", credentials: "include" });
  //   if (res.ok) {
  //     setBudgets((prev) => prev.filter((b) => b.id !== id));
  //     toast.success("Budget deleted");
  //   }
  //   else {
  //     toast.error("Failed to delete budget");
  //   }

  // };

  const totalSpent = allExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  const visibleTotal = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  const thisMonth = allExpenses
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + (e.amount ?? 0), 0);

  const getInitials = () => {
    if (user?.name) return user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    return user?.email?.slice(0, 2).toUpperCase();
  };

  const getDisplayName = () => user?.name || user?.email?.split("@")[0];
  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const getBarColor = (pct) => {
    if (pct >= 100) return "bg-red-500";
    if (pct >= 80) return "bg-amber-500";
    return "bg-gradient-to-r from-blue-500 to-indigo-500";
  };

  const getStatusBadge = (pct) => {
    if (pct >= 100) return { text: "Exceeded", cls: "bg-red-500/15 border-red-500/30 text-red-400" };
    if (pct >= 80) return { text: "Warning", cls: "bg-amber-500/15 border-amber-500/30 text-amber-400" };
    return { text: "On Track", cls: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" };
  };

  const inputClass = "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] placeholder-white/20 outline-none focus:border-blue-400/50 focus:bg-white/[0.08] transition-all";
  const filterInputClass = "bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] placeholder-white/25 outline-none focus:border-blue-400/40 transition-all";
  const hasActiveFilters = filters.category || filters.from || filters.to || filters.search;

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-[3px] border-white/10 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-white/30 text-sm">Loading your dashboard...</span>
    </div>
  );

  const stats = [
    { label: "Total Spent", value: `₹${totalSpent.toFixed(2)}`, icon: "📊", color: "text-blue-400" },
    { label: "This Month", value: `₹${thisMonth.toFixed(2)}`, icon: "📅", color: "text-violet-400" },
    { label: "Transactions", value: allExpenses.length, icon: "🧾", color: "text-emerald-400" },
    { label: "Budgets", value: budgets.length, icon: "🎯", color: "text-amber-400" },
  ];

  const tabs = [
    { key: "expenses", label: "🧾 Expenses" },
    { key: "analytics", label: "📊 Analytics" },
    { key: "budget", label: "🎯 Budget" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        @keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modal-in { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fade-up { animation: fade-up 0.45s ease forwards; }
        .animate-modal { animation: modal-in 0.25s ease forwards; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.4); cursor: pointer; }
        select option { background: #13131f; color: #fff; }
      `}</style>

      {/* Orbs */}
      <div className="fixed w-[600px] h-[600px] bg-blue-500 rounded-full blur-[100px] opacity-[0.07] -top-48 -left-48 pointer-events-none" />
      <div className="fixed w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[100px] opacity-[0.07] -bottom-24 -right-24 pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-[18px] border-b border-white/[0.06] bg-[rgba(10,10,15,0.85)] backdrop-blur-xl">
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-lg"><button className="cursor-pointer" onClick={(e) => router.push("/dashboard")}>💸</button></div>
          <span className="font-semibold text-base"><button className="cursor-pointer" onClick={(e) => router.push("/dashboard")}>ExpenseTrack </button> </span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-[13px] font-bold"><button onClick={(e) => router.push("/profile")} className="cursor-pointer"> {getInitials()}</button></div>
            <div>
              <div className="text-[13px] font-medium"> <button className="cursor-pointer" onClick={(e) => router.push("/profile")}>{getDisplayName()} </button></div>
              <div className="text-[11px] text-white/35"> <button className="cursor-pointer" onClick={(e) => router.push("/profile")}>{user?.email}</button></div>
            </div>
          </div>
          <ThemeToggle />
          <button onClick={handleLogout} className="bg-red-500/10 border border-red-500/25 text-red-300 px-5 py-2.5 rounded-xl text-[13px] font-medium hover:bg-red-500/20 transition-colors cursor-pointer">
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-[1100px] mx-auto px-10 py-11 relative z-10">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-9 animate-fade-up">
          <div>
            <h1 className="text-[34px] font-bold mb-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Hey, {getDisplayName()} 👋
            </h1>
            <p className="text-white/35 text-sm">Here&apos;s your expense overview</p>
          </div>
          {/* ✅ Header buttons — Add Expense + Export CSV + Export Excel */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={exporting || allExpenses.length === 0}
              className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[13px] font-medium px-4 py-2.5 rounded-xl hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              📄 CSV
            </button>
            {/* Export Excel */}
            <button
              onClick={handleExportExcel}
              disabled={exporting || allExpenses.length === 0}
              className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[13px] font-medium px-4 py-2.5 rounded-xl hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              📊 Excel
            </button>
            {/* Add Expense */}
            <button
              onClick={() => router.push("/add-expense")}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
            >
              + Add Expense
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-up"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-up">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 hover:border-white/[0.13] transition-colors">
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="text-white/40 text-[11px] font-medium uppercase tracking-wider mb-1.5">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        <PlanUsageBar
          plan={user?.plan || "free"}
          counts={{
            expenses: allExpenses.length,
            categories: categories.length,
            budgets: budgets.length,
          }}
        />

        {/* ✅ Budget Alert Banner */}
        {(() => {
          const exceeded = budgets.filter(b => b.percentage >= 100);
          const warning = budgets.filter(b => b.percentage >= 80 && b.percentage < 100);

          if (exceeded.length === 0 && warning.length === 0) return null;

          return (
            <div className="flex flex-col gap-2 mb-6 animate-fade-up">
              {/* 🚨 Exceeded budgets */}
              {exceeded.map((b) => (
                <div key={b.id} className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3.5">
                  <span className="text-lg">🚨</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-red-300 text-[13px] font-medium">
                      <span className="font-bold">{b.category?.name || "Overall"}</span> budget exceeded!
                      You&apos;re ₹{Math.abs(b.remaining).toFixed(2)} over your ₹{b.amount.toFixed(2)} limit
                      for {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][b.month - 1]}.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab("budget")}
                    className="text-red-400 text-[12px] font-medium hover:text-red-300 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    View →
                  </button>
                </div>
              ))}

              {/* ⚠️ Warning budgets */}
              {warning.map((b) => (
                <div key={b.id} className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3.5">
                  <span className="text-lg">⚠️</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-amber-300 text-[13px] font-medium">
                      <span className="font-bold">{b.category?.name || "Overall"}</span> budget is{" "}
                      <span className="font-bold">{b.percentage.toFixed(0)}% used</span>.
                      Only ₹{b.remaining.toFixed(2)} remaining for{" "}
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][b.month - 1]}.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab("budget")}
                    className="text-amber-400 text-[12px] font-medium hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    View →
                  </button>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 animate-fade-up">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${activeTab === tab.key
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                : "bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── ANALYTICS TAB ── */}
        {activeTab === "analytics" && (
          <div className="animate-fade-up">
            {user?.plan !== "premium" ? (
              // ✅ Show locked state for free users
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-16 text-center">
                <div className="text-5xl mb-4">📊</div>
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-full px-4 py-1.5 text-amber-300 text-[12px] font-medium mb-4">
                  👑 Premium Feature
                </div>
                <h3 className="text-[18px] font-bold mb-3">Analytics is a Premium Feature</h3>
                <p className="text-white/40 text-sm mb-7 max-w-[360px] mx-auto leading-relaxed">
                  Upgrade to Premium to unlock charts, spending trends, category breakdowns and more.
                </p>
                <button
                  onClick={() => setUpgradePrompt({
                    message: "Upgrade to view your spending analytics, pie charts, monthly trends and daily breakdown.",
                    feature: "analytics",
                  })}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-[14px] rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  👑 Unlock Analytics
                </button>
              </div>
            ) : (
              <ExpenseCharts
                byCategory={analytics?.byCategory || []}
                byMonth={analytics?.byMonth || []}
                byDay={analytics?.byDay || []}
              />
            )}
          </div>
        )}
        {/* ── BUDGET TAB ── */}
        {activeTab === "budget" && (
          <div className="animate-fade-up flex flex-col gap-6">
            {/* Add Budget Form */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7">
              <h2 className="text-[17px] font-semibold mb-1">Set a Budget</h2>
              <p className="text-white/30 text-[12px] mb-6">Set an overall monthly budget or per category</p>

              {budgetError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-[13px] mb-5">{budgetError}</div>
              )}

              <form onSubmit={handleAddBudget} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">Amount (₹) *</label>
                  <input type="number" className={inputClass} placeholder="5000" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} min="1" required />
                </div>
                <div>
                  <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">Month *</label>
                  <select className={inputClass} value={budgetMonth} onChange={(e) => setBudgetMonth(e.target.value)}>
                    {MONTHS.map((m, i) => (<option key={i} value={i + 1}>{m}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">Year *</label>
                  <select className={inputClass} value={budgetYear} onChange={(e) => setBudgetYear(e.target.value)}>
                    {[2024, 2025, 2026, 2027].map((y) => (<option key={y} value={y}>{y}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">Category</label>
                  <select className={inputClass} value={budgetCategoryId} onChange={(e) => setBudgetCategoryId(e.target.value)}>
                    <option value="">Overall (no category)</option>
                    {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
                <button type="submit" disabled={addingBudget} className="py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[14px] font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed">
                  {addingBudget ? "Adding..." : "+ Set Budget"}
                </button>
              </form>
            </div>

            {/* Budget Cards */}
            {budgets.length === 0 ? (
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-16 text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-[17px] font-semibold mb-2">No budgets set yet</h3>
                <p className="text-white/30 text-sm">Set your first budget above to start tracking</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {budgets.map((budget) => {
                  const badge = getStatusBadge(budget.percentage);
                  const barColor = getBarColor(budget.percentage);
                  const cappedPct = Math.min(budget.percentage, 100);
                  return (
                    <div key={budget.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.13] transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[15px] font-semibold">{budget.category ? budget.category.name : "Overall"}</span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.text}</span>
                          </div>
                          <p className="text-white/35 text-[12px]">{MONTHS[budget.month - 1]} {budget.year}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteBudget(budget)}
                          disabled={deletingBudgetId === budget.id}
                          className="bg-red-500/[0.08] border border-red-500/20 text-red-300 text-[11px] px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          {deletingBudgetId === budget.id ? "..." : "Delete"}
                        </button>
                      </div>
                      <div className="mb-3">
                        <div className="w-full bg-white/[0.06] rounded-full h-2.5 overflow-hidden">
                          <div className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${cappedPct}%` }} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[13px]">
                        <div><span className="text-white/40">Spent </span><span className="font-semibold text-white">₹{budget.spent.toFixed(2)}</span></div>
                        <div><span className={`font-bold text-[15px] ${budget.percentage >= 100 ? "text-red-400" : budget.percentage >= 80 ? "text-amber-400" : "text-emerald-400"}`}>{budget.percentage.toFixed(0)}%</span></div>
                        <div className="text-right"><span className="text-white/40">Limit </span><span className="font-semibold text-white">₹{budget.amount.toFixed(2)}</span></div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/[0.06] text-[12px] text-center">
                        {budget.remaining >= 0
                          ? <span className="text-emerald-400">₹{budget.remaining.toFixed(2)} remaining</span>
                          : <span className="text-red-400">₹{Math.abs(budget.remaining).toFixed(2)} over budget!</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── EXPENSES TAB ── */}
        {activeTab === "expenses" && (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 animate-fade-up">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-white/[0.06]">
              <input
                type="text"
                placeholder="🔍 Search expenses..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className={`${filterInputClass} min-w-[180px] flex-1`}
              />
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })} className={filterInputClass}>
                <option value="">All Categories</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value, page: 1 })} className={filterInputClass} />
              <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value, page: 1 })} className={filterInputClass} />
              <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className={filterInputClass}>
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_high">High Amount</option>
                <option value="amount_low">Low Amount</option>
              </select>
              {hasActiveFilters && (
                <button onClick={() => setFilters({ category: "", from: "", to: "", search: "", sort: "latest", page: 1 })}
                  className="bg-red-500/10 border border-red-500/20 text-red-300 text-[12px] px-3.5 py-2.5 rounded-xl hover:bg-red-500/20 transition-colors cursor-pointer whitespace-nowrap">
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Table Header */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div>
                <h2 className="text-[17px] font-semibold mb-0.5">All Expenses</h2>
                <p className="text-[12px] text-white/30">{expenses.length} records {hasActiveFilters && `(filtered from ${allExpenses.length} total)`}</p>
              </div>
              {expenses.length > 0 && (
                <button onClick={() => router.push("/add-expense")}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-[13px] px-5 py-2.5 rounded-xl hover:opacity-90 transition-all cursor-pointer">
                  + New
                </button>
              )}
            </div>

            {/* Expense List */}
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-5xl mb-4">{hasActiveFilters ? "🔍" : "🧾"}</div>
                <h3 className="text-[17px] font-semibold mb-2">{hasActiveFilters ? "No results found" : "No expenses yet"}</h3>
                <p className="text-white/30 text-sm mb-7">{hasActiveFilters ? "Try changing your filters" : "Start tracking your spending"}</p>
                {!hasActiveFilters && (
                  <button onClick={() => router.push("/add-expense")}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-all cursor-pointer">
                    + Add First Expense
                  </button>
                )}
              </div>
            ) : (
              <div>
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between gap-3 py-4 border-b border-white/[0.05] last:border-none last:pb-0 first:pt-0">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-[42px] h-[42px] bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-lg shrink-0">💸</div>
                      <div className="min-w-0">
                        <div className="text-[14px] font-medium mb-1 truncate">
                          {expense.note ? expense.note : <span className="text-white/30 italic">No note</span>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[12px] text-white/30">{formatDate(expense.date)}</span>
                          {expense.category && (
                            <span className="bg-violet-500/10 border border-violet-500/25 text-violet-300 text-[11px] px-2 py-0.5 rounded-full">{expense.category.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-[16px] font-bold text-red-400">-₹{(expense.amount ?? 0).toFixed(2)}</span>
                      <button onClick={() => openEdit(expense)} className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[12px] px-3.5 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer">Edit</button>
                      <button onClick={() => handleDelete(expense)} disabled={deletingId === expense.id}
                        className="bg-red-500/[0.08] border border-red-500/20 text-red-300 text-[12px] px-3.5 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                        {deletingId === expense.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center mt-5 pt-5 border-t border-white/[0.08]">
                  <span className="text-sm text-white/45 font-medium">Total</span>
                  <span className="text-xl font-bold text-red-400">-₹{visibleTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/[0.06]">
              <span className="text-[12px] text-white/30">Page {filters.page}</span>
              <div className="flex gap-2">
                <button disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="bg-white/[0.04] border border-white/10 text-white/50 text-[13px] px-4 py-2 rounded-xl hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                  ← Prev
                </button>
                <button disabled={filters.page >= totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="bg-white/[0.04] border border-white/10 text-white/50 text-[13px] px-4 py-2 rounded-xl hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm" onClick={closeEdit}>
          <div className="w-full max-w-[460px] bg-[#13131f] border border-white/10 rounded-3xl p-9 animate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-7">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Edit Expense</h2>
                <p className="text-white/35 text-[13px]">Update the details below</p>
              </div>
              <button onClick={closeEdit} className="text-white/30 hover:text-white/70 text-xl transition-colors cursor-pointer bg-transparent border-none">✕</button>
            </div>
            {editError && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-[13px] mb-5">{editError}</div>}
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div>
                <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">Amount (₹) *</label>
                <input type="number" className={inputClass} placeholder="0.00" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} min="0.01" step="0.01" required />
              </div>
              <div>
                <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">Note</label>
                <input type="text" className={inputClass} placeholder="What did you spend on?" value={editNote} onChange={(e) => setEditNote(e.target.value)} />
              </div>
              <div>
                <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">Category</label>
                <select className={inputClass} value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)}>
                  <option value="">No category</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">Date *</label>
                <input type="date" className={inputClass} value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={closeEdit} className="flex-1 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white/50 text-[14px] font-medium hover:bg-white/[0.08] transition-all cursor-pointer">Cancel</button>
                <button type="submit" disabled={updating} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[14px] font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed">
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ✅ Delete Confirmation Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-[400px] bg-[#13131f] border border-white/10 rounded-3xl p-8 animate-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-14 h-14 bg-red-500/15 border border-red-500/25 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5">
              🗑️
            </div>

            {/* Text */}
            <h2 className="text-[18px] font-bold text-center mb-2">
              Delete {confirmDelete.type === "expense" ? "Expense" : "Budget"}?
            </h2>
            <p className="text-white/40 text-[13px] text-center mb-7 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="text-white font-medium">&quot;{confirmDelete.name}&quot;</span>?
              <br />This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white/50 text-[14px] font-medium hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAction}
                className="flex-1 py-3 bg-red-500/90 hover:bg-red-500 text-white text-[14px] font-semibold rounded-xl transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ✅ Upgrade Prompt Modal */}
      {upgradePrompt && (
        <UpgradePrompt
          message={upgradePrompt.message}
          feature={upgradePrompt.feature}
          onClose={() => setUpgradePrompt(null)}
        />
      )}
    </div>
  );
}