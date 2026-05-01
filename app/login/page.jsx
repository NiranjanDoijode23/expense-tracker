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


  const { data: session } = useSession();

  useEffect(() => {
    if (session) router.push("/dashboard");
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
    <div className="min-h-screen bg-[#050508] text-on-background font-body-main antialiased selection:bg-primary-container selection:text-on-primary-container">
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fade-up 0.5s ease forwards; }
      `}</style>
      <header className="sticky top-0 w-full z-50 border-b bg-[#0d0d14]/80 backdrop-blur-xl border-white/5 shadow-2xl shadow-indigo-500/10">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto">
          <div className="text-xl font-bold tracking-tighter text-white font-h2">SpEndora</div>
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => router.push("/")} className="text-gray-400 hover:text-white transition-colors duration-200 font-caption">Expenses</button>
            <button onClick={() => router.push("/")} className="text-gray-400 hover:text-white transition-colors duration-200 font-caption">Analytics</button>
            <button onClick={() => router.push("/")} className="text-gray-400 hover:text-white transition-colors duration-200 font-caption">Budget</button>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => router.push("/register")} className="bg-primary-container text-on-primary-container px-5 py-2 rounded-xl font-caption font-bold active:scale-95 transition-transform">
              Get Started
            </button>
          </div>
        </div>
      </header>
      <main className="min-h-[calc(100vh-170px)] flex items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* Background Orbs */}
      <div className="absolute w-[500px] h-[500px] bg-blue-500 rounded-full blur-[80px] opacity-15 -top-24 -left-36 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[80px] opacity-15 -bottom-20 -right-24 pointer-events-none" />

      <div className="w-full max-w-[440px] glass-card rounded-[2rem] p-8 sm:p-10 relative z-10 animate-fade-up">

        {/* Icon */}
        <div className="w-[52px] h-[52px] bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-2xl mb-7">
          💸
        </div>

        <h1 className="font-h1 text-3xl sm:text-h2 text-white mb-2">Welcome Back</h1>
        <p className="font-body-sm text-on-surface-variant mb-8">Access your financial precision dashboard.</p>

        <button onClick={handleGoogleLogin} disabled={googleLoading || loading} className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-surface-container border border-white/10 rounded-xl hover:bg-white/5 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
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
          <span className="font-caption text-white">{googleLoading ? "Connecting..." : "Continue with Google"}</span>
        </button>

        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-white/5" />
          <span className="flex-shrink mx-4 text-gray-500 font-caption uppercase tracking-widest text-[10px]">or continue with</span>
          <div className="flex-grow border-t border-white/5" />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block font-caption text-on-surface-variant mb-2 ml-1">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#050508] border-[#141420] rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none font-body-sm border"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-caption text-on-surface-variant mb-2 ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#050508] border-[#141420] rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none font-body-sm border"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white py-4 rounded-xl font-body-main font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In to Dashboard"}
          </button>

        </form>

        <p className="text-center mt-8 font-body-sm text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-white font-semibold hover:underline decoration-primary">
            Create one for free
          </Link>
        </p>
      </div>
      </main>
      <footer className="bg-[#050508] w-full border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center py-10 px-6 max-w-7xl mx-auto gap-4">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <div className="text-lg font-black text-white font-h2">SpEndora</div>
            <p className="text-sm font-light text-gray-500 font-caption">© 2024 SpEndora. Precision Finance.</p>
          </div>
          <div className="flex gap-8">
            <button onClick={() => router.push("/")} className="text-gray-500 hover:text-[#6366f1] transition-colors font-caption">Privacy</button>
            <button onClick={() => router.push("/")} className="text-gray-500 hover:text-[#6366f1] transition-colors font-caption">Terms</button>
            <button onClick={() => router.push("/")} className="text-gray-500 hover:text-[#6366f1] transition-colors font-caption">Security</button>
            <button onClick={() => router.push("/")} className="text-gray-500 hover:text-[#6366f1] transition-colors font-caption">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
}