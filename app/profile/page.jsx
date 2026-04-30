"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../components/ThemeToggle";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Name form
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState(null); // { type: "success"|"error", text }

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/auth/profile", { credentials: "include" });
      if (!res.ok) { router.push("/login"); return; }
      const data = await res.json();
      setUser(data.user);
      setName(data.user.name || "");
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await signOut({ redirect: false });
    router.push("/login");
  };

  // Update name
  const handleUpdateName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    setNameMsg(null);

    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    setSavingName(false);

    if (!res.ok) {
      toast.error(data.error || "Failed to update name")
    } else {
      setUser((prev) => ({ ...prev, name: data.user.name }));
      toast.success("Name updated! ✅");
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }

    setSavingPassword(true);

    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    setSavingPassword(false);

    if (!res.ok) {
      toast.error(data.error || "Failed to change password");

    } else {
      toast.success("Password changed successfully! 🔒");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const getInitials = () => {
    if (user?.name) return user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    return user?.email?.slice(0, 2).toUpperCase();
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const getStrength = (p) => {
    if (!p) return null;
    if (p.length < 6) return { label: "Weak", color: "bg-red-500", bars: 1 };
    if (p.length < 10) return { label: "Medium", color: "bg-amber-500", bars: 2 };
    return { label: "Strong", color: "bg-emerald-500", bars: 3 };
  };

  const strength = getStrength(newPassword);

  const inputClass = `
    w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all
    bg-white/[0.05] dark:bg-white/[0.05] border-white/10 dark:border-white/10
    text-white dark:text-white placeholder-white/25
    focus:border-blue-400/50 focus:bg-white/[0.08]
    light:bg-gray-100 light:border-gray-200 light:text-gray-900
  `;

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] dark:bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-[3px] border-white/10 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-white/30 text-sm">Loading profile...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] dark:bg-[#0a0a0f] light:bg-gray-50 text-white dark:text-white light:text-gray-900 transition-colors">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        @keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fade-up 0.45s ease forwards; }
        input[type="password"]::-ms-reveal { display: none; }
        select option { background: #13131f; }
      `}</style>

      {/* Orbs */}
      <div className="fixed w-[500px] h-[500px] bg-blue-500 rounded-full blur-[100px] opacity-[0.06] -top-40 -left-40 pointer-events-none" />
      <div className="fixed w-[400px] h-[400px] bg-violet-500 rounded-full blur-[100px] opacity-[0.06] -bottom-20 -right-20 pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-[18px] border-b border-white/[0.06] bg-[rgba(10,10,15,0.85)] backdrop-blur-xl">
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-lg"><button className="cursor-pointer" onClick={(e) => router.push("/dashboard")}>💸</button></div>
          <span className="font-semibold text-base"><button className="cursor-pointer" onClick={(e) => router.push("/dashboard")}>ExpenseTrack </button> </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="bg-red-500/10 border border-red-500/25 text-red-300 px-4 py-2 rounded-xl text-[13px] font-medium hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            Logout
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-white/40 text-[13px] hover:text-white/80 transition-colors cursor-pointer bg-transparent border-none"
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-[780px] mx-auto px-6 py-12 relative z-10">

        {/* Page Header */}
        <div className="mb-10 animate-fade-up">
          <h1 className="text-[32px] font-bold mb-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>
            My Profile
          </h1>
          <p className="text-white/35 text-sm">Manage your account settings</p>
        </div>

        {/* ── Account Stats Card ── */}
        <div className="animate-fade-up bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-white/10 rounded-2xl p-7 mb-6">
          <div className="flex items-center gap-5 mb-6">
            {/* Avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-xl font-bold shrink-0">
              {getInitials()}
            </div>
            <div>
              <div className="text-xl font-bold mb-0.5">
                {user?.name || user?.email?.split("@")[0]}
              </div>
              <div className="text-white/45 text-sm">{user?.email}</div>
              <div className="text-white/30 text-[12px] mt-1">
                Member since {formatDate(user?.createdAt)}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Spent", value: `₹${(user?.totalSpent ?? 0).toFixed(2)}`, icon: "💸" },
              { label: "Transactions", value: user?._count?.expenses ?? 0, icon: "🧾" },
              { label: "Categories", value: user?._count?.categories ?? 0, icon: "🗂️" },
            ].map((s, i) => (
              <div key={i} className="bg-white/[0.06] border border-white/[0.08] rounded-xl p-4 text-center">
                <div className="text-xl mb-1.5">{s.icon}</div>
                <div className="text-[11px] text-white/40 uppercase tracking-wider mb-1">{s.label}</div>
                <div className="text-[17px] font-bold text-white">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Update Name Card ── */}
        <div className="animate-fade-up bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 mb-6">
          <h2 className="text-[16px] font-semibold mb-1">Display Name</h2>
          <p className="text-white/30 text-[13px] mb-6">This name shows on your dashboard</p>

          {nameMsg && (
            <div className={`rounded-xl px-4 py-3 text-[13px] mb-5 ${nameMsg.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border border-red-500/30 text-red-300"
              }`}>
              {nameMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateName} className="flex gap-3">
            <input
              type="text"
              placeholder="Your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] placeholder-white/25 outline-none focus:border-blue-400/50 transition-all"
            />
            <button
              type="submit"
              disabled={savingName}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[14px] font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {savingName ? "Saving..." : "Save Name"}
            </button>
          </form>
        </div>

        {/* ── Change Password Card ── */}
        <div className="animate-fade-up bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 mb-6">
          <h2 className="text-[16px] font-semibold mb-1">Change Password</h2>
          <p className="text-white/30 text-[13px] mb-6">Enter your current password to set a new one</p>

          {passwordMsg && (
            <div className={`rounded-xl px-4 py-3 text-[13px] mb-5 ${passwordMsg.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border border-red-500/30 text-red-300"
              }`}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            {/* Current password */}
            <div>
              <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">
                Current Password *
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] placeholder-white/25 outline-none focus:border-blue-400/50 transition-all"
                required
              />
            </div>

            {/* New password */}
            <div>
              <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">
                New Password *
              </label>
              <input
                type="password"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] placeholder-white/25 outline-none focus:border-blue-400/50 transition-all"
                required
                minLength={8}
              />
              {/* Strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div key={level} className={`flex-1 h-[3px] rounded-full transition-all duration-300 ${level <= strength.bars ? strength.color : "bg-white/10"}`} />
                    ))}
                  </div>
                  <p className="text-[11px] text-white/30 mt-1">{strength.label} password</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-white/45 text-[11px] font-medium uppercase tracking-widest mb-2">
                Confirm New Password *
              </label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white text-[14px] placeholder-white/25 outline-none focus:border-blue-400/50 transition-all ${confirmPassword && confirmPassword !== newPassword
                    ? "border-red-500/50"
                    : "border-white/10"
                  }`}
                required
              />
              {/* Match indicator */}
              {confirmPassword && (
                <p className={`text-[11px] mt-1 ${confirmPassword === newPassword ? "text-emerald-400" : "text-red-400"}`}>
                  {confirmPassword === newPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={savingPassword || (confirmPassword && confirmPassword !== newPassword)}
              className="w-full py-3 mt-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[14px] font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {savingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

        {/* ── Appearance Card ── */}
        <div className="animate-fade-up bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7">
          <h2 className="text-[16px] font-semibold mb-1">Appearance</h2>
          <p className="text-white/30 text-[13px] mb-6">Toggle between dark and light mode</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🌙</div>
              <div>
                <div className="text-[14px] font-medium">Theme</div>
                <div className="text-white/35 text-[12px]">Switch between dark and light mode</div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

      </main>
    </div>
  );
}