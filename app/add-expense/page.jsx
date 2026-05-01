"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function getLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AddExpensePage() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(getLocalDateInputValue());

  const [categories, setCategories] = useState([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function fetchCategories() {
    const res = await fetch("/api/category", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories || []);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchCategories(); }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    setCategoryError("");

    const res = await fetch("/api/category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim() }),
      credentials: "include",
    });

    const data = await res.json();
    setAddingCategory(false);

    if (!res.ok) {
      if (res.status === 403 && data.limitReached) {
        setCategoryError("Category limit reached (5/5). Upgrade to Premium for unlimited categories.");
        return;
      }
      setCategoryError(data.error || "Failed to add category");
      return;
    }

    setCategories((prev) => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
    setCategoryId(String(data.category.id));
    setNewCategoryName("");
    setShowNewCategory(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(amount), note, categoryId: categoryId || null, date }),
      credentials: "include",
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      if (res.status === 403 && data.limitReached) {
        router.push("/pricing?reason=expense_limit");
        return;
      }
      setError(data.error || "Failed to add expense");
      toast.error(data.error || "Failed to add expense");
      return;
    }

    toast.success("Expense added! 🧾");
    setTimeout(() => router.push("/dashboard"), 1200);
  };

  const selectedCategory = categories.find((c) => String(c.id) === categoryId);

  const inputClass = "bg-[#050508] border border-[#141420] w-full text-sm rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-white placeholder-gray-500";
  const activeCategory = selectedCategory?.name?.toLowerCase() || "";
  const categoryIcon = activeCategory.includes("dining") || activeCategory.includes("food")
    ? "restaurant"
    : activeCategory.includes("travel")
      ? "commute"
      : activeCategory.includes("health")
        ? "medical_services"
        : activeCategory.includes("home") || activeCategory.includes("rent")
          ? "home"
          : activeCategory.includes("utility")
            ? "bolt"
            : "shopping_cart";

  return (
    <div className="min-h-screen bg-[#050508] text-on-background font-body-main antialiased selection:bg-primary-container selection:text-on-primary-container">
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fade-up 0.45s ease forwards; }
        select option { background: #13131f; color: #fff; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.4); cursor: pointer; }
      `}</style>

      {/* TopNavBar */}
      <header className="sticky top-0 w-full z-50 border-b border-white/5 bg-[#0d0d14]/80 backdrop-blur-xl shadow-2xl shadow-indigo-500/10">
        <nav className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8 cursor-pointer" onClick={() => router.push("/dashboard")}>
            <span className="text-xl font-bold tracking-tighter text-white">SpEndora</span>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-400 text-sm hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Dashboard
          </button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-up">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <section className="lg:col-span-7 flex flex-col gap-8">
            <div className="mb-1">
              <h1 className="font-h1 text-white text-4xl md:text-5xl mb-3">New Expense</h1>
              <p className="text-on-surface-variant max-w-xl">
                Record your transaction with precision. Every detail counts toward your financial clarity.
              </p>
            </div>
            <div className="glass-card rounded-3xl p-6 md:p-8">

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-[13px] mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Amount */}
                <div>
                  <label className="block text-gray-400 text-[11px] font-medium uppercase tracking-widest mb-2">
                    Amount (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl font-semibold">₹</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0.01"
                      step="0.01"
                      required
                      className={`${inputClass} text-2xl md:text-3xl font-data-display pl-10`}
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-gray-400 text-[11px] font-medium uppercase tracking-widest mb-2">
                    Note
                  </label>
                  <input
                    type="text"
                    placeholder="What did you spend on?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Category list */}
                <div>
                  <label className="block text-gray-400 text-[11px] font-medium uppercase tracking-widest mb-2">
                    Category
                  </label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
                    <option value="">No category</option>
                    {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>

                  {/* Add new category */}
                  {!showNewCategory ? (
                    <button
                      type="button"
                      onClick={() => setShowNewCategory(true)}
                      className="flex items-center gap-1 text-blue-400 text-[12px] mt-2 bg-none border-none cursor-pointer hover:text-blue-300 transition-colors p-0"
                    >
                      + Create new category
                    </button>
                  ) : (
                    <div className="mt-2.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Food, Transport..."
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                          autoFocus
                          className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-3 text-white text-[14px] placeholder-white/20 outline-none focus:border-indigo-400/55 transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          disabled={addingCategory || !newCategoryName.trim()}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[13px] font-semibold px-4 py-3 rounded-xl hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {addingCategory ? "..." : "Add"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowNewCategory(false); setNewCategoryName(""); setCategoryError(""); }}
                          className="bg-white/[0.04] border border-white/10 text-white/40 text-[13px] px-3.5 py-3 rounded-xl hover:bg-white/[0.08] transition-all cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      {categoryError && (
                        <p className="text-red-300 text-[12px] mt-1.5">{categoryError}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Date */}
                  <div>
                    <label className="block text-gray-400 text-[11px] font-medium uppercase tracking-widest mb-2">
                      Transaction Date *
                    </label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputClass} />
                  </div>
                  {/* Preview category */}
                  <div>
                    <label className="block text-gray-400 text-[11px] font-medium uppercase tracking-widest mb-2">
                      Selected Category
                    </label>
                    <div className={`${inputClass} flex items-center gap-2 text-white/80`}>
                      <span className="material-symbols-outlined text-primary">{categoryIcon}</span>
                      {selectedCategory?.name || "No category selected"}
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-4 bg-gradient-to-tr from-[#6366f1] to-[#a855f7] text-white font-semibold text-[15px] rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                >
                  {submitting ? "Adding..." : "Add Expense"}
                </button>
              </form>
            </div>
          </section>

          <aside className="lg:col-span-5 flex flex-col gap-5">
            <div>
              <p className="text-caption text-outline uppercase tracking-widest mb-3">Live Preview</p>
              <div className="glass-card rounded-3xl p-7">
                <div className="flex justify-between items-start mb-10">
                  <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">{categoryIcon}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-data-display text-4xl">₹{parseFloat(amount || 0).toFixed(2)}</p>
                    <p className="text-on-surface-variant text-sm">Pending Confirmation</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-outline text-sm">Merchant / Note</span>
                    <span className="text-white font-medium">{note || "No note"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-outline text-sm">Category</span>
                    <span className="text-white font-medium">{selectedCategory?.name || "Uncategorized"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline text-sm">Date</span>
                    <span className="text-white font-medium">{new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container rounded-xl p-6 border border-white/5">
              <div className="flex gap-4 items-start">
                <div className="bg-tertiary-container/20 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-tertiary">insights</span>
                </div>
                <div>
                  <p className="text-white font-medium">Monthly Insight</p>
                  <p className="text-on-surface-variant text-body-sm">Consistent entries improve trend and category accuracy across charts.</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container rounded-xl p-6 border border-white/5">
              <div className="flex gap-4 items-start">
                <div className="bg-secondary-container/20 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-secondary">verified_user</span>
                </div>
                <div>
                  <p className="text-white font-medium">Secure Transaction</p>
                  <p className="text-on-surface-variant text-body-sm">All entries are safely stored and reflected in dashboard analytics instantly.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}