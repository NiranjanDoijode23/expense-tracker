"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    };
    fetchUser();
  }, []);

  const freeFeatures = [
    { text: "Up to 50 expenses/month", available: true },
    { text: "Up to 5 categories", available: true },
    { text: "Up to 3 budgets", available: true },
    { text: "Basic dashboard", available: true },
    { text: "Last 30 days history", available: true },
    { text: "Charts & Analytics", available: false },
    { text: "CSV + Excel Export", available: false },
    { text: "Unlimited expenses", available: false },
    { text: "Unlimited categories", available: false },
    { text: "Monthly email reports", available: false },
  ];

  const premiumFeatures = [
    { text: "Unlimited expenses", available: true },
    { text: "Unlimited categories", available: true },
    { text: "Unlimited budgets", available: true },
    { text: "Full analytics & charts", available: true },
    { text: "CSV + Excel export", available: true },
    { text: "Full history (all time)", available: true },
    { text: "Monthly email reports", available: true },
    { text: "Budget alerts via email", available: true },
    { text: "Priority support", available: true },
    { text: "Early access to new features", available: true },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        @keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fade-up 0.5s ease forwards; }
      `}</style>

      {/* Orbs */}
      <div className="fixed w-[600px] h-[600px] bg-amber-500 rounded-full blur-[120px] opacity-[0.05] -top-48 -right-48 pointer-events-none" />
      <div className="fixed w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[100px] opacity-[0.06] -bottom-24 -left-24 pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-[18px] border-b border-white/[0.06] bg-[rgba(10,10,15,0.85)] backdrop-blur-xl">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-lg">💸</div>
          <span className="font-semibold text-base">ExpenseTrack</span>
        </div>
        <button
          onClick={() => router.push(user ? "/dashboard" : "/login")}
          className="text-white/40 text-[13px] hover:text-white/80 transition-colors cursor-pointer"
        >
          {user ? "← Dashboard" : "Sign in"}
        </button>
      </nav>

      {/* Header */}
      <div className="text-center pt-20 pb-16 px-6 animate-fade-up">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-full px-4 py-1.5 text-amber-300 text-[12px] font-medium mb-6">
          👑 Simple, transparent pricing
        </div>
        <h1 className="text-[42px] font-black mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          Choose your plan
        </h1>
        <p className="text-white/40 text-lg max-w-[480px] mx-auto">
          Start free, upgrade when you need more. No hidden fees.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-[900px] mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">

          {/* FREE CARD */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8">
            <div className="mb-6">
              <div className="text-[13px] text-white/50 font-medium uppercase tracking-widest mb-2">Free</div>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-[42px] font-black">₹0</span>
                <span className="text-white/40 text-sm pb-2">/month</span>
              </div>
              <p className="text-white/40 text-sm">Perfect to get started</p>
            </div>

            {/* Features */}
            <div className="flex flex-col gap-3 mb-8">
              {freeFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${f.available ? "text-emerald-400" : "text-white/20"}`}>
                    {f.available ? "✓" : "✕"}
                  </span>
                  <span className={`text-[13px] ${f.available ? "text-white/70" : "text-white/25 line-through"}`}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {user?.plan === "free" ? (
              <div className="w-full py-3.5 bg-white/[0.06] border border-white/10 text-white/50 text-[14px] font-medium rounded-xl text-center">
                ✓ Current Plan
              </div>
            ) : (
              <button
                onClick={() => router.push("/register")}
                className="w-full py-3.5 bg-white/[0.06] border border-white/10 text-white text-[14px] font-semibold rounded-xl hover:bg-white/[0.10] active:scale-95 transition-all cursor-pointer"
              >
                Get Started Free
              </button>
            )}
          </div>

          {/* PREMIUM CARD */}
          <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-3xl p-8 overflow-hidden">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />

            {/* Popular badge */}
            <div className="absolute top-5 right-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>

            <div className="mb-6 relative">
              <div className="text-[13px] text-amber-400 font-medium uppercase tracking-widest mb-2">👑 Premium</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-[42px] font-black">₹199</span>
                <span className="text-white/40 text-sm pb-2">/month</span>
              </div>
              <div className="text-white/35 text-[12px] mb-3">or ₹1,499/year (save 37%)</div>
              <p className="text-white/50 text-sm">Everything unlimited</p>
            </div>

            {/* Features */}
            <div className="flex flex-col gap-3 mb-8 relative">
              {premiumFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-amber-400">✓</span>
                  <span className="text-[13px] text-white/80">{f.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {user?.plan === "premium" ? (
              <div className="w-full py-3.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[14px] font-semibold rounded-xl text-center">
                ✓ Current Plan — Active
              </div>
            ) : (
              <button
                onClick={() => alert("Payment coming soon! Contact us to upgrade manually.")}
                className="relative w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[15px] font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-[0_0_30px_rgba(245,158,11,0.3)]"
              >
                👑 Upgrade to Premium
              </button>
            )}

            <p className="text-white/25 text-[11px] text-center mt-3 relative">
              Payment integration coming soon
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-[22px] font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            {[
              {
                q: "Can I use the free plan forever?",
                a: "Yes! The free plan has no time limit. You can use it as long as you want.",
              },
              {
                q: "What happens when I hit the free limit?",
                a: "You'll see a prompt to upgrade. Your existing data stays safe.",
              },
              {
                q: "How do I upgrade to Premium?",
                a: "Payment integration is coming soon. Contact us to upgrade manually for now.",
              },
              {
                q: "Can I downgrade back to free?",
                a: "Yes, you can downgrade anytime. Your data is preserved.",
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
                <h3 className="text-[14px] font-semibold mb-2">{faq.q}</h3>
                <p className="text-white/40 text-[13px] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}