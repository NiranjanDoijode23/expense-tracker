"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../components/ThemeToggle";
import { signIn } from "next-auth/react";
import Link from "next/link";

  import { useSession } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();


const { data: session, status } = useSession();

  useEffect(() => {
  if (session) {
    router.push("/dashboard"); // ✅ redirect if already logged in
  }
}, [session, router]);

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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } finally {
      setGoogleLoading(false);
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

        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-3.5 text-white text-[15px] font-medium hover:bg-white/[0.10] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mb-5"
        >
          {googleLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>

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
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
            Register
          </Link>
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