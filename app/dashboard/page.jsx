"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Edit state
  const [editingExpense, setEditingExpense] = useState(null); // holds the expense being edited
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const [userRes, expenseRes, catRes] = await Promise.all([
        fetch("/api/auth/me", { credentials: "include" }),
        fetch("/api/expense", { credentials: "include" }),
        fetch("/api/category", { credentials: "include" }),
      ]);

      if (!userRes.ok) { router.push("/login"); return; }

      const [userData, expData, catData] = await Promise.all([
        userRes.json(),
        expenseRes.ok ? expenseRes.json() : { expenses: [] },
        catRes.ok ? catRes.json() : { categories: [] },
      ]);

      setUser(userData.user);
      setExpenses(expData.expenses || []);
      setCategories(catData.categories || []);
      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    const res = await fetch(`/api/expense/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setExpenses((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  };

  // Open edit modal and pre-fill form
  const openEdit = (expense) => {
    setEditingExpense(expense);
    setEditAmount(expense.amount.toString());
    setEditNote(expense.note || "");
    setEditCategoryId(expense.categoryId ? String(expense.categoryId) : "");
    setEditDate(new Date(expense.date).toISOString().split("T")[0]);
    setEditError("");
  };

  const closeEdit = () => {
    setEditingExpense(null);
    setEditError("");
  };

  // Send PUT request
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

    if (!res.ok) {
      setEditError(data.error || "Failed to update expense");
      return;
    }

    // Update expense in list locally
    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === editingExpense.id ? { ...data.expense, category: categories.find(c => String(c.id) === editCategoryId) || null } : exp
      )
    );

    closeEdit();
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = expenses
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const getInitials = () => {
    if (user?.name) return user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    return user?.email?.slice(0, 2).toUpperCase();
  };

  const getDisplayName = () => user?.name || user?.email?.split("@")[0];

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const inputClass = "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] placeholder-white/20 outline-none focus:border-blue-400/50 focus:bg-white/[0.08] transition-all";

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-[3px] border-white/10 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-white/30 text-sm">Loading your dashboard...</span>
    </div>
  );

  const stats = [
    { label: "Total Spent",  value: `₹${totalAmount.toFixed(2)}`, icon: "📊", color: "text-blue-400"    },
    { label: "This Month",   value: `₹${thisMonth.toFixed(2)}`,   icon: "📅", color: "text-violet-400"  },
    { label: "Transactions", value: expenses.length,               icon: "🧾", color: "text-emerald-400" },
    { label: "Categories",   value: categories.length,             icon: "🗂️",  color: "text-amber-400"  },
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
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-lg">💸</div>
          <span className="font-semibold text-base">ExpenseTrack</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-[13px] font-bold">
              {getInitials()}
            </div>
            <div>
              <div className="text-[13px] font-medium">{getDisplayName()}</div>
              <div className="text-[11px] text-white/35">{user?.email}</div>
            </div>
          </div>
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
            <p className="text-white/35 text-sm">Here's your expense overview</p>
          </div>
          <button
            onClick={() => router.push("/add-expense")}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm px-6 py-3.5 rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
          >
            + Add Expense
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-up">
          {stats.map((stat, i) => (
            <div key={stat.label} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 hover:border-white/[0.13] transition-colors">
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="text-white/40 text-[11px] font-medium uppercase tracking-wider mb-1.5">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Expenses Table */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 animate-fade-up">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div>
              <h2 className="text-[17px] font-semibold mb-0.5">All Expenses</h2>
              <p className="text-[12px] text-white/30">{expenses.length} total records</p>
            </div>
            {expenses.length > 0 && (
              <button
                onClick={() => router.push("/add-expense")}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-[13px] px-5 py-2.5 rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                + New
              </button>
            )}
          </div>

          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-4">🧾</div>
              <h3 className="text-[17px] font-semibold mb-2">No expenses yet</h3>
              <p className="text-white/30 text-sm mb-7">Start tracking your spending</p>
              <button
                onClick={() => router.push("/add-expense")}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                + Add First Expense
              </button>
            </div>
          ) : (
            <div>
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between gap-3 py-4 border-b border-white/[0.05] last:border-none last:pb-0 first:pt-0"
                >
                  {/* Left */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-[42px] h-[42px] bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-lg shrink-0">
                      💸
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium mb-1 truncate">
                        {expense.note? expense.note: <span className="text-white/30 italic">No note</span>}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] text-white/30">{formatDate(expense.date)}</span>
                        {expense.category && (
                          <span className="bg-violet-500/10 border border-violet-500/25 text-violet-300 text-[11px] px-2 py-0.5 rounded-full">
                            {expense.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right — amount + Edit + Delete */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[16px] font-bold text-red-400">
                      -₹{(expense.amount ?? 0).toFixed(2)}
                    </span>

                    {/* Edit button */}
                    <button
                      onClick={() => openEdit(expense)}
                      className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[12px] px-3.5 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(expense.id)}
                      disabled={deletingId === expense.id}
                      className="bg-red-500/[0.08] border border-red-500/20 text-red-300 text-[12px] px-3.5 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {deletingId === expense.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-between items-center mt-5 pt-5 border-t border-white/[0.08]">
                <span className="text-sm text-white/45 font-medium">Total</span>
                <span className="text-xl font-bold text-red-400">-₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── EDIT MODAL ── */}
      {editingExpense && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
          onClick={closeEdit}
        >
          <div
            className="w-full max-w-[460px] bg-[#13131f] border border-white/10 rounded-3xl p-9 animate-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-7">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Edit Expense
                </h2>
                <p className="text-white/35 text-[13px]">Update the details below</p>
              </div>
              <button
                onClick={closeEdit}
                className="text-white/30 hover:text-white/70 text-xl transition-colors cursor-pointer bg-none border-none"
              >
                ✕
              </button>
            </div>

            {/* Error */}
            {editError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-[13px] mb-5">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdate} className="flex flex-col gap-4">

              {/* Amount */}
              <div>
                <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="0.00"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">
                  Note
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="What did you spend on?"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">
                  Category
                </label>
                <select
                  className={inputClass}
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  className={inputClass}
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white/50 text-[14px] font-medium hover:bg-white/[0.08] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[14px] font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}