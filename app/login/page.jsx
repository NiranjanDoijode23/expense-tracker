"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../components/ThemeToggle";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError(data.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background Orbs */}
      <div className="absolute w-[500px] h-[500px] bg-blue-500 rounded-full blur-[80px] opacity-15 -top-24 -left-36 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[80px] opacity-15 -bottom-20 -right-24 pointer-events-none" />

      {/* Card */}
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white/[0.04] border border-white/[0.09] rounded-3xl px-10 py-11 backdrop-blur-xl relative z-10 animate-fade-up">

        {/* Icon */}
        <div className="w-[52px] h-[52px] bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-2xl mb-7">
          💸
        </div>

        <h1 className="text-3xl font-bold text-white mb-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>
          Welcome back
        </h1>
        <p className="text-white/40 text-sm mb-8">
          Sign in to your expense tracker
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">

          {/* Email */}
          <div>
            <label className="block text-white/50 text-[11px] font-medium uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-[15px] placeholder-white/25 outline-none focus:border-blue-400/50 focus:bg-white/[0.07] transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-white/50 text-[11px] font-medium uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-[15px] placeholder-white/25 outline-none focus:border-blue-400/50 focus:bg-white/[0.07] transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-[15px] rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <p className="text-center text-white/30 text-[13px] mt-7">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
            Register
          </a>
        </p>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.5s ease forwards; }
      `}</style>
    </div>
  );
}