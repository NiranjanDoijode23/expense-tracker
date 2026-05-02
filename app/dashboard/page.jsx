"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ExpenseCharts from "../components/ExpenseCharts";
import { exportCSV, exportExcel } from "@/lib/exportExpenses"; // ✅ import export utils
import ThemeToggle from "../components/ThemeToggle";
import toast from "react-hot-toast"; // ✅ add this
import { signOut } from "next-auth/react";
import UpgradePrompt from "../components/UpgradePrompt";
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


const handleDeleteBudget = async (budget) => {
 setConfirmDelete({
    type: "budget",
    id: budget.id,
    name: `${budget.category?.name || "Overall"} budget for ${MONTHS[budget.month - 1]} ${budget.year}`,
  });
};

// ✅ Add this new function — called when user clicks "Yes Delete"
const confirmDeleteBudget = async () => {
  if (!confirmDelete) return;
  setDeletingBudgetId(confirmDelete.id);

  try {
    const res = await fetch(`/api/budget/${confirmDelete.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Failed to delete budget");
      return;
    }

    setBudgets((prev) => prev.filter((b) => b.id !== confirmDelete.id));
    toast.success("Budget deleted");

  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setDeletingBudgetId(null);
    setConfirmDelete(null); // ✅ close modal
  }
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
  const planBudgetLimit = PLANS[user?.plan || "free"]?.limits?.budgets || 0;
  const activeBudgetSummary = planBudgetLimit ? `${budgets.length} / ${planBudgetLimit}` : `${budgets.length}`;
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

  const tabs = [
    { key: "expenses", label: "🧾 Expenses" },
    { key: "analytics", label: "📊 Analytics" },
    { key: "budget", label: "🎯 Budget" },
  ];

  return (
    <div className="min-h-screen bg-[#050508] text-on-background font-body-main antialiased selection:bg-primary-container selection:text-on-primary-container pb-20">
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modal-in { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fade-up { animation: fade-up 0.45s ease forwards; }
        .animate-modal { animation: modal-in 0.25s ease forwards; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.4); cursor: pointer; }
        select option { background: #13131f; color: #fff; }
      `}</style>

      {/* TopNavBar */}
      <header className="sticky top-0 w-full z-50 border-b border-white/5 bg-[#0d0d14]/80 backdrop-blur-xl shadow-2xl shadow-indigo-500/10">
        <nav className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tighter text-white cursor-pointer" onClick={() => router.push("/dashboard")}>SpEndora</span>
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => setActiveTab("expenses")} className={`text-sm font-sans antialiased tracking-tight transition-colors duration-200 ${activeTab === "expenses" ? "text-[#6366f1] border-b-2 border-[#6366f1] pb-1" : "text-gray-400 hover:text-white"}`}>Expenses</button>
              <button onClick={() => setActiveTab("analytics")} className={`text-sm font-sans antialiased tracking-tight transition-colors duration-200 ${activeTab === "analytics" ? "text-[#6366f1] border-b-2 border-[#6366f1] pb-1" : "text-gray-400 hover:text-white"}`}>Analytics</button>
              <button onClick={() => setActiveTab("budget")} className={`text-sm font-sans antialiased tracking-tight transition-colors duration-200 ${activeTab === "budget" ? "text-[#6366f1] border-b-2 border-[#6366f1] pb-1" : "text-gray-400 hover:text-white"}`}>Budget</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button onClick={handleLogout} className="material-symbols-outlined p-2 text-gray-400 hover:text-white transition-colors" title="Logout">logout</button>
            <div onClick={() => router.push("/profile")} className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white/10 cursor-pointer">
              {getInitials()}
            </div>
          </div>
        </nav>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10 animate-fade-up">

        {/* Hero Greeting & Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
          <div>
            <p className="font-caption text-caption text-primary mb-2">DASHBOARD OVERVIEW</p>
            <h1 className="font-h1 text-3xl sm:text-4xl md:text-h1 text-white">Good morning, {getDisplayName()} 👋</h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={handleExportCSV} disabled={exporting || allExpenses.length === 0} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-medium text-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-sm">description</span> CSV
            </button>
            <button onClick={handleExportExcel} disabled={exporting || allExpenses.length === 0} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-medium text-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-sm">table</span> Excel
            </button>
            <button onClick={() => router.push("/add-expense")} className="flex items-center gap-2 bg-gradient-to-tr from-[#6366f1] to-[#a855f7] text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap">
              <span className="material-symbols-outlined text-sm">add</span> Expense
            </button>
          </div>
        </div>

        {/* Stat Cards Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="glass-card hover-lift p-6 rounded-2xl group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined">payments</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm font-medium">Total Spent</p>
            <h3 className="font-data-display text-data-display text-white mt-1">₹{totalSpent.toFixed(2)}</h3>
          </div>
          
          <div className="glass-card hover-lift p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm font-medium">This Month</p>
            <h3 className="font-data-display text-data-display text-white mt-1">₹{thisMonth.toFixed(2)}</h3>
          </div>
          
          <div className="glass-card hover-lift p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-tertiary/10 text-tertiary">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm font-medium">Transactions</p>
            <h3 className="font-data-display text-data-display text-white mt-1">{allExpenses.length}</h3>
          </div>
          
          <div className="glass-card hover-lift p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-primary-container/10 text-primary-container">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm font-medium">Active Budgets</p>
            <h3 className="font-data-display text-data-display text-white mt-1">{activeBudgetSummary}</h3>
          </div>
        </div>

        {/* ✅ Budget Alert Banner */}
{(() => {
  const exceeded = budgets.filter(b => b.percentage >= 100);
  const warning  = budgets.filter(b => b.percentage >= 80 && b.percentage < 100);

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
              You're ₹{Math.abs(b.remaining).toFixed(2)} over your ₹{b.amount.toFixed(2)} limit
              for {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][b.month - 1]}.
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
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][b.month - 1]}.
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
              <div className="glass-card rounded-2xl p-16 text-center border-t-4 border-t-amber-500">
                <span className="material-symbols-outlined text-6xl text-amber-500 mb-4">insights</span>
                <div className="flex justify-center mb-4">
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-full px-4 py-1.5 text-amber-400 text-[12px] font-medium">
                    <span className="material-symbols-outlined text-[14px]">workspace_premium</span> Premium Feature
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Analytics is a Premium Feature</h3>
                <p className="text-gray-400 text-sm mb-7 max-w-[360px] mx-auto leading-relaxed">
                  Upgrade to Premium to unlock charts, spending trends, category breakdowns and more.
                </p>
                <button
                  onClick={() => setUpgradePrompt({
                    message: "Upgrade to view your spending analytics, pie charts, monthly trends and daily breakdown.",
                    feature: "analytics",
                  })}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-[14px] rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
                >
                  <span className="material-symbols-outlined text-[18px]">lock_open</span> Unlock Analytics
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
            <div className="glass-card rounded-2xl p-7">
              <h2 className="text-[17px] font-semibold mb-1 text-white">Set a Budget</h2>
              <p className="text-gray-400 text-[12px] mb-6">Set an overall monthly budget or per category</p>

              {budgetError && (
                <div className="bg-error-container/20 border border-error/20 rounded-xl px-4 py-3 text-error text-[13px] mb-5 flex items-center gap-2"><span className="material-symbols-outlined text-sm">error</span> {budgetError}</div>
              )}

              <form onSubmit={handleAddBudget} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="block text-gray-400 text-[11px] font-medium uppercase tracking-widest mb-2">Amount (₹) *</label>
                  <input type="number" className="bg-[#050508] border border-[#141420] w-full text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-white placeholder-gray-500" placeholder="5000" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} min="1" required />
                </div>
                <div>
                  <label className="block text-gray-400 text-[11px] font-medium uppercase tracking-widest mb-2">Month *</label>
                  <select className="bg-[#050508] border border-[#141420] w-full text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-white" value={budgetMonth} onChange={(e) => setBudgetMonth(e.target.value)}>
                    {MONTHS.map((m, i) => (<option key={i} value={i + 1}>{m}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-[11px] font-medium uppercase tracking-widest mb-2">Year *</label>
                  <select className="bg-[#050508] border border-[#141420] w-full text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-white" value={budgetYear} onChange={(e) => setBudgetYear(e.target.value)}>
                    {[2024, 2025, 2026, 2027].map((y) => (<option key={y} value={y}>{y}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-[11px] font-medium uppercase tracking-widest mb-2">Category</label>
                  <select className="bg-[#050508] border border-[#141420] w-full text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-white" value={budgetCategoryId} onChange={(e) => setBudgetCategoryId(e.target.value)}>
                    <option value="">Overall (no category)</option>
                    {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
                <button type="submit" disabled={addingBudget} className="py-2.5 bg-gradient-to-tr from-[#6366f1] to-[#a855f7] text-white text-[14px] font-semibold rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none">
                  {addingBudget ? "Adding..." : "+ Set Budget"}
                </button>
              </form>
            </div>

            {/* Budget Cards */}
            {budgets.length === 0 ? (
              <div className="glass-card rounded-2xl p-16 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">track_changes</span>
                <h3 className="text-[17px] font-semibold mb-2 text-white">No budgets set yet</h3>
                <p className="text-gray-400 text-sm">Set your first budget above to start tracking</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {budgets.map((budget) => {
                  const badge = getStatusBadge(budget.percentage);
                  const barColor = getBarColor(budget.percentage);
                  const cappedPct = Math.min(budget.percentage, 100);
                  return (
                    <div key={budget.id} className="glass-card hover-lift rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[15px] font-semibold text-white">{budget.category ? budget.category.name : "Overall"}</span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.text}</span>
                          </div>
                          <p className="text-gray-400 text-[12px]">{MONTHS[budget.month - 1]} {budget.year}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteBudget(budget)}
                          disabled={deletingBudgetId === budget.id}
                          className="material-symbols-outlined text-gray-600 hover:text-error transition-colors p-1 disabled:opacity-40"
                          title="Delete Budget"
                        >
                          {deletingBudgetId === budget.id ? "hourglass_empty" : "delete"}
                        </button>
                      </div>
                      <div className="mb-3">
                        <div className="w-full bg-white/[0.06] rounded-full h-2.5 overflow-hidden">
                          <div className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${cappedPct}%` }} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[13px]">
                        <div><span className="text-gray-400">Spent </span><span className="font-semibold text-white">₹{budget.spent.toFixed(2)}</span></div>
                        <div><span className={`font-bold text-[15px] ${budget.percentage >= 100 ? "text-error" : budget.percentage >= 80 ? "text-amber-400" : "text-emerald-400"}`}>{budget.percentage.toFixed(0)}%</span></div>
                        <div className="text-right"><span className="text-gray-400">Limit </span><span className="font-semibold text-white">₹{budget.amount.toFixed(2)}</span></div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/[0.06] text-[12px] text-center">
                        {budget.remaining >= 0
                          ? <span className="text-emerald-400">₹{budget.remaining.toFixed(2)} remaining</span>
                          : <span className="text-error">₹{Math.abs(budget.remaining).toFixed(2)} over budget!</span>
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
          <div className="glass-card rounded-2xl overflow-hidden animate-fade-up">
            {/* Filters Section (SpEndora adapted) */}
            <div className="p-6 flex flex-col gap-4 border-b border-white/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="font-h2 text-data-display text-white">Recent Expenses</h2>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">search</span>
                    <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} className="bg-[#050508] border border-[#141420] text-sm rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all w-64 text-white placeholder-gray-500" placeholder="Search transactions..." type="text"/>
                  </div>
                </div>
              </div>

              {/* Advanced Filters Row */}
              <div className="flex flex-wrap gap-3 items-center">
                <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })} className="bg-[#050508] border border-[#141420] text-sm rounded-xl px-4 py-2 text-white outline-none focus:border-primary transition-all">
                  <option value="">All Categories</option>
                  {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value, page: 1 })} className="bg-[#050508] border border-[#141420] text-sm rounded-xl px-4 py-2 text-gray-400 outline-none focus:border-primary transition-all" />
                <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value, page: 1 })} className="bg-[#050508] border border-[#141420] text-sm rounded-xl px-4 py-2 text-gray-400 outline-none focus:border-primary transition-all" />
                <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className="bg-[#050508] border border-[#141420] text-sm rounded-xl px-4 py-2 text-white outline-none focus:border-primary transition-all">
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount_high">High Amount</option>
                  <option value="amount_low">Low Amount</option>
                </select>
                {hasActiveFilters && (
                  <button onClick={() => setFilters({ category: "", from: "", to: "", search: "", sort: "latest", page: 1 })}
                    className="flex items-center gap-1 bg-error-container/20 border border-error/20 text-error text-sm px-3 py-2 rounded-xl hover:bg-error-container/40 transition-colors cursor-pointer whitespace-nowrap">
                    <span className="material-symbols-outlined text-sm">close</span> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Expense List */}
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">{hasActiveFilters ? "search_off" : "receipt_long"}</span>
                <h3 className="text-lg font-semibold text-white mb-2">{hasActiveFilters ? "No results found" : "No expenses yet"}</h3>
                <p className="text-gray-400 text-sm mb-7">{hasActiveFilters ? "Try changing your filters" : "Start tracking your spending"}</p>
                {!hasActiveFilters && (
                  <button onClick={() => router.push("/add-expense")} className="flex items-center gap-2 bg-gradient-to-tr from-[#6366f1] to-[#a855f7] text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-sm">add</span> Add First Expense
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-y border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity & Note</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-primary">shopping_bag</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{expense.note ? expense.note : <span className="text-gray-500 italic">No note</span>}</p>
                              <p className="text-xs text-gray-500 truncate">Expense Record</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {expense.category ? (
                            <span className="px-2 py-1 rounded-md bg-secondary/10 text-secondary text-[10px] font-bold uppercase">{expense.category.name}</span>
                          ) : (
                            <span className="text-gray-500 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">{formatDate(expense.date)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-white whitespace-nowrap">-₹{(expense.amount ?? 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEdit(expense)} className="material-symbols-outlined text-gray-500 hover:text-primary transition-colors text-xl p-1" title="Edit">edit</button>
                            <button onClick={() => handleDelete(expense)} disabled={deletingId === expense.id} className="material-symbols-outlined text-gray-500 hover:text-error transition-colors text-xl p-1 disabled:opacity-40" title="Delete">{deletingId === expense.id ? "hourglass_empty" : "delete"}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination & Total Footer */}
            {expenses.length > 0 && (
              <div className="p-4 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-gray-500">Page {filters.page} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="p-1 rounded bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button disabled={filters.page >= totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="p-1 rounded bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-400">Total</span>
                  <span className="text-lg font-bold text-error">-₹{visibleTotal.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm" onClick={closeEdit}>
          <div className="w-full max-w-[460px] glass-card rounded-3xl p-9 animate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-7">
              <div>
                <h2 className="text-xl font-bold mb-1 text-white">Edit Expense</h2>
                <p className="text-gray-400 text-[13px]">Update the details below</p>
              </div>
              <button onClick={closeEdit} className="text-gray-500 hover:text-white transition-colors cursor-pointer bg-transparent border-none material-symbols-outlined">close</button>
            </div>
            {editError && <div className="bg-error-container/20 border border-error/20 rounded-xl px-4 py-3 text-error text-[13px] mb-5 flex items-center gap-2"><span className="material-symbols-outlined text-sm">error</span>{editError}</div>}
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-400 text-[11px] font-medium uppercase tracking-widest mb-2">Amount (₹) *</label>
                <input type="number" className="bg-[#050508] border border-[#141420] w-full text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-white placeholder-gray-500" placeholder="0.00" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} min="0.01" step="0.01" required />
              </div>
              <div>
                <label className="block text-gray-400 text-[11px] font-medium uppercase tracking-widest mb-2">Note</label>
                <input type="text" className="bg-[#050508] border border-[#141420] w-full text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-white placeholder-gray-500" placeholder="What did you spend on?" value={editNote} onChange={(e) => setEditNote(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-400 text-[11px] font-medium uppercase tracking-widest mb-2">Category</label>
                <select className="bg-[#050508] border border-[#141420] w-full text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-white" value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)}>
                  <option value="">No category</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-[11px] font-medium uppercase tracking-widest mb-2">Date *</label>
                <input type="date" className="bg-[#050508] border border-[#141420] w-full text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-400" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={closeEdit} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-[14px] font-medium hover:bg-white/10 hover:text-white transition-all cursor-pointer">Cancel</button>
                <button type="submit" disabled={updating} className="flex-1 py-3 bg-gradient-to-tr from-[#6366f1] to-[#a855f7] text-white text-[14px] font-semibold rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none">
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ✅ Delete Confirmation Modal */}
      {confirmDelete && confirmDelete.type === "expense" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-[400px] glass-card rounded-3xl p-8 animate-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-14 h-14 bg-error-container/20 border border-error/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-error text-3xl">delete</span>
            </div>

            {/* Text */}
            <h2 className="text-[18px] font-bold text-center mb-2 text-white">
              Delete {confirmDelete.type === "expense" ? "Expense" : "Budget"}?
            </h2>
            <p className="text-gray-400 text-[13px] text-center mb-7 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="text-white font-medium">&quot;{confirmDelete.name}&quot;</span>?
              <br />This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-[14px] font-medium hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAction}
                className="flex-1 py-3 bg-error hover:bg-error/90 text-[#690005] text-[14px] font-semibold rounded-xl transition-all cursor-pointer"
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

      {/* ── DELETE CONFIRMATION MODAL ── */}
{confirmDelete && confirmDelete.type === "budget" && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
    onClick={() => setConfirmDelete(null)}
  >
    <div
      className="w-full max-w-[400px] bg-[#13131f] border border-white/10 rounded-3xl p-8 text-center animate-modal"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Icon */}
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
        🗑️
      </div>

      {/* Text */}
      <h2 className="text-[19px] font-bold text-white mb-2">
        Delete Budget?
      </h2>
      <p className="text-white/40 text-[13px] leading-relaxed mb-7">
        Are you sure you want to delete{" "}
        <span className="text-white font-semibold">"{confirmDelete.name}"</span>?
        <br />
        <span className="text-red-400/70 text-[12px] mt-1 inline-block">
          This action cannot be undone.
        </span>
      </p>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setConfirmDelete(null)}
          className="flex-1 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white/50 text-[14px] font-medium hover:bg-white/[0.08] active:scale-95 transition-all duration-150 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={confirmDeleteBudget}
          disabled={deletingBudgetId === confirmDelete.id}
          className="flex-1 py-3 bg-red-500/90 hover:bg-red-500 active:scale-95 text-white text-[14px] font-semibold rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deletingBudgetId === confirmDelete.id ? "Deleting..." : "Yes, Delete"}
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}