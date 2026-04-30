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
  const [success, setSuccess] = useState(false);

  async function fetchCategories() {
    const res = await fetch("/api/category", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories || []);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchCategories(); }, []);

 // AFTER
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
    // ✅ NEW — free user hit 5 category limit
    if (res.status === 403 && data.limitReached) {
      setCategoryError(
        "Category limit reached (5/5). Upgrade to Premium for unlimited categories."
      );
      return;
    }
    // any other error
    setCategoryError(data.error || "Failed to add category");
    return;
  }

  setCategories((prev) => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
  setCategoryId(String(data.category.id));
  setNewCategoryName("");
  setShowNewCategory(false);
};

  const handleSubmit = async (e) => {

    // ✅ Handle plan limit reached
    if (!res.ok) {
      if (res.status === 403 && data.limitReached) {
        setError(""); // clear form error
        // Redirect to pricing with message
        window.location.href = "/pricing?reason=expense_limit";
        return;
      }
      setError(data.error || "Failed to add expense");
      toast.error(data.error || "Failed to add expense");
      return;
    }
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
    setError(data.error || "Failed to add expense"); // ← change this block
    return;
  }
    toast.success("Expense added! 🧾");
    // setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 1200);
  };

  const selectedCategory = categories.find((c) => String(c.id) === categoryId);

  const inputClass = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-[15px] placeholder-white/20 outline-none focus:border-indigo-400/55 focus:bg-white/[0.06] transition-all";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pop-in { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-up { animation: fade-up 0.45s ease forwards; }
        .animate-pop-in  { animation: pop-in 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        select option { background: #13131f; color: #fff; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.4); cursor: pointer; }
      `}</style>

      {/* Orbs */}
      <div className="fixed w-[500px] h-[500px] bg-blue-500 rounded-full blur-[100px] opacity-[0.08] -top-36 -right-24 pointer-events-none" />
      <div className="fixed w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[100px] opacity-[0.08] -bottom-24 -left-24 pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-[18px] border-b border-white/[0.06] bg-[rgba(10,10,15,0.85)] backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-lg">💸</div>
          <span className="font-semibold text-base">ExpenseTrack</span>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-white/40 text-[13px] bg-none border-none cursor-pointer hover:text-white/80 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-[500px] animate-fade-up">

          {/* Success */}
          {success ? (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-16 text-center">
              <div className="text-5xl mb-5 animate-pop-in">✅</div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Expense Added!
              </h2>
              <p className="text-white/35 text-sm">Redirecting to dashboard...</p>
            </div>
          ) : (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-10">

              {/* Header */}
              <div className="mb-8">
                <div className="w-[50px] h-[50px] bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-[22px] mb-5">
                  🧾
                </div>
                <h1 className="text-[26px] font-bold mb-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Add New Expense
                </h1>
                <p className="text-white/35 text-sm">Record what you spent</p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-[13px] mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Amount */}
                <div>
                  <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    required
                    className={inputClass}
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">
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

                {/* Category */}
                <div>
                  <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>

                  {/* Selected pill */}
                  {selectedCategory && (
                    <div className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[12px] px-2.5 py-1 rounded-full mt-2">
                      🏷️ {selectedCategory.name}
                    </div>
                  )}

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

                {/* Date */}
                <div>
                  <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>

                {/* Live Preview */}
                {amount && (
                  <div className="bg-indigo-500/[0.08] border border-indigo-500/20 rounded-xl px-4 py-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Preview</div>
                      <div className="text-[13px] text-white/60">{note || "No note"}</div>
                      {selectedCategory && (
                        <div className="text-[11px] text-indigo-300 mt-0.5">🏷️ {selectedCategory.name}</div>
                      )}
                    </div>
                    <div className="text-xl font-bold text-red-400">
                      -₹{parseFloat(amount || 0).toFixed(2)}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-[15px] rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-55 disabled:cursor-not-allowed disabled:translate-y-0 cursor-pointer"
                >
                  {submitting ? "Adding..." : "Add Expense"}
                </button>

              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}