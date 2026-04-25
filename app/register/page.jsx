"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: "Weak", color: "bg-red-500", bars: 1 };
    if (password.length < 10) return { label: "Medium", color: "bg-yellow-500", bars: 2 };
    return { label: "Strong", color: "bg-green-500", bars: 3 };
  };

  const strength = getStrength();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background Orbs */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[80px] opacity-15 -top-24 -right-36 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-blue-500 rounded-full blur-[80px] opacity-15 -bottom-20 -left-24 pointer-events-none" />

      {/* Card */}
      <div className="w-full max-w-md bg-white/[0.04] border border-white/[0.09] rounded-3xl px-10 py-11 backdrop-blur-xl relative z-10 animate-fade-up">

        {/* Icon */}
        <div className="w-13 h-13 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center text-2xl mb-7 w-[52px] h-[52px]">
          ✨
        </div>

        <h1 className="text-3xl font-bold text-white mb-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>
          Create account
        </h1>
        <p className="text-white/40 text-sm mb-8">
          Start tracking your expenses today
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-5">

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
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-[15px] placeholder-white/25 outline-none focus:border-blue-400/50 focus:bg-white/[0.07] transition-all"
            />

            {/* Password Strength */}
            {strength && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 h-[3px] rounded-full transition-all duration-300 ${
                        level <= strength.bars ? strength.color : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-white/30 mt-1.5">{strength.label} password</p>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-[15px] rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        {/* Login link */}
        <p className="text-center text-white/30 text-[13px] mt-7">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
            Sign in
          </a>
        </p>

      </div>

      {/* Fonts */}
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