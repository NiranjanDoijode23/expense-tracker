"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "./components/ThemeToggle";

export default function LandingPage() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState({});
  const observerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const features = [
    { icon: "🧾", title: "Smart Tracking", desc: "Log every expense in seconds. Add notes, categories, and dates with an intuitive interface built for speed." },
    { icon: "🗂️", title: "Custom Categories", desc: "Organize spending your way. Create categories that match your lifestyle — food, travel, bills, and beyond." },
    { icon: "📊", title: "Live Dashboard", desc: "See your financial health at a glance. Real-time totals, monthly breakdowns, and transaction history." },
    { icon: "🎯", title: "Budget Goals", desc: "Set monthly budgets and track how close you are. Stay in control before you overspend." },
    { icon: "🔒", title: "Secure & Private", desc: "Your data belongs to you. JWT-based auth and encrypted passwords keep your finances private." },
    { icon: "⚡", title: "Lightning Fast", desc: "Built on Next.js and Prisma. No lag, no delays — just instant responses every time." },
  ];

  const steps = [
    { num: "01", title: "Create your account", desc: "Sign up in under 30 seconds. No credit card, no nonsense." },
    { num: "02", title: "Add your expenses", desc: "Log what you spend with a note, category, and date." },
    { num: "03", title: "Track your progress", desc: "Watch your dashboard update in real-time and stay on budget." },
  ];

  const stats = [
    { value: "₹0", label: "Hidden Fees" },
    { value: "100%", label: "Private Data" },
    { value: "<1s", label: "Load Time" },
    { value: "∞", label: "Transactions" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060612",
      color: "#fff",
      fontFamily: "'Sora', sans-serif",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #060612; }
        ::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 99px; }

        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-left {
          opacity: 0;
          transform: translateX(-40px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal-left.visible {
          opacity: 1;
          transform: translateX(0);
        }
        .reveal-right {
          opacity: 0;
          transform: translateX(40px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal-right.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .hero-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(52px, 8vw, 96px);
          font-weight: 900;
          line-height: 1.0;
          letter-spacing: -2px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-link {
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #fff; }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
          border-radius: 14px;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          padding: 14px 32px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 30px rgba(59,130,246,0.3);
        }
        .btn-primary:hover {
          opacity: 0.92;
          transform: translateY(-2px);
          box-shadow: 0 0 50px rgba(59,130,246,0.5);
        }

        .btn-ghost {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          color: #fff;
          font-size: 15px;
          font-weight: 500;
          font-family: 'Sora', sans-serif;
          padding: 14px 32px;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }

        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 36px 32px;
          transition: border-color 0.3s, transform 0.3s, background 0.3s;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(59,130,246,0.05), rgba(139,92,246,0.05));
          opacity: 0;
          transition: opacity 0.3s;
        }
        .feature-card:hover {
          border-color: rgba(99,102,241,0.35);
          transform: translateY(-4px);
          background: rgba(255,255,255,0.05);
        }
        .feature-card:hover::before { opacity: 1; }

        .step-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 40px 36px;
          position: relative;
          transition: border-color 0.3s, transform 0.3s;
        }
        .step-card:hover {
          border-color: rgba(99,102,241,0.3);
          transform: translateY(-3px);
        }

        .stat-card {
          text-align: center;
          padding: 36px 24px;
          border-radius: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          transition: transform 0.3s;
        }
        .stat-card:hover { transform: scale(1.03); }

        .floating {
          animation: float 6s ease-in-out infinite;
        }
        .floating-slow {
          animation: float 9s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }

        .pulse-ring {
          animation: pulse-ring 3s ease-out infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 1; }
          70% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }

        .ticker {
          animation: ticker 20s linear infinite;
          display: flex;
          gap: 48px;
          white-space: nowrap;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .glow-blue {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .glow-purple {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .glow-pink {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(244,114,182,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .grid-bg {
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .noise {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 999;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        @keyframes hero-in {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-animate { animation: hero-in 0.9s ease forwards; }
        .hero-animate-2 { animation: hero-in 0.9s 0.15s ease forwards; opacity: 0; }
        .hero-animate-3 { animation: hero-in 0.9s 0.3s ease forwards; opacity: 0; }
        .hero-animate-4 { animation: hero-in 0.9s 0.45s ease forwards; opacity: 0; }

        .mock-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          backdrop-filter: blur(20px);
        }

        .expense-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .expense-item:last-child { border-bottom: none; }
      `}</style>

      {/* Noise overlay */}
      <div className="noise" />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 60px",
        background: scrollY > 50 ? "rgba(6,6,18,0.9)" : "transparent",
        backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
        borderBottom: scrollY > 50 ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>💸</div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.3px" }}>ExpenseTrack</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#how" className="nav-link">How it works</a>
          <a href="#stats" className="nav-link">Why us</a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          <button className="btn-ghost" onClick={() => router.push("/login")} style={{ padding: "10px 22px", fontSize: 14 }}>
            Sign in
          </button>
          <button className="btn-primary" onClick={() => router.push("/register")} style={{ padding: "10px 22px", fontSize: 14 }}>
            Get started free
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "120px 24px 80px",
        position: "relative",
        overflow: "hidden",
      }} className="grid-bg">

        {/* Glows */}
        <div className="glow-blue" style={{ width: 700, height: 700, top: -100, left: "50%", transform: "translateX(-50%)" }} />
        <div className="glow-purple" style={{ width: 500, height: 500, top: 200, left: "10%" }} />
        <div className="glow-pink" style={{ width: 400, height: 400, top: 300, right: "5%" }} />

        {/* Badge */}
        <div className="hero-animate" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.25)",
          borderRadius: 999, padding: "8px 18px",
          fontSize: 13, color: "#93c5fd", fontWeight: 500,
          marginBottom: 36,
        }}>
          <span style={{ width: 7, height: 7, background: "#3b82f6", borderRadius: "50%", display: "inline-block" }} />
          Your personal finance companion
        </div>

        {/* Title */}
        <h1 className="hero-title hero-animate-2" style={{ maxWidth: 900, marginBottom: 28 }}>
          Take control of{" "}
          <span className="gradient-text">every rupee</span>
          {" "}you spend
        </h1>

        {/* Subtitle */}
        <p className="hero-animate-3" style={{
          fontSize: 20, color: "rgba(255,255,255,0.45)",
          maxWidth: 560, lineHeight: 1.7, marginBottom: 48,
          fontWeight: 300,
        }}>
          ExpenseTrack makes budgeting effortless — log expenses, create categories, and visualize your spending in real time.
        </p>

        {/* CTAs */}
        <div className="hero-animate-4" style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 80 }}>
          <button className="btn-primary" onClick={() => router.push("/register")} style={{ padding: "16px 40px", fontSize: 16 }}>
            Start tracking free →
          </button>
          <button className="btn-ghost" onClick={() => router.push("/login")} style={{ padding: "16px 40px", fontSize: 16 }}>
            Sign in
          </button>
        </div>

        {/* Mock Dashboard Preview */}
        <div className="hero-animate-4 floating" style={{
          width: "100%", maxWidth: 780,
          position: "relative",
        }}>
          {/* Glow behind card */}
          <div style={{
            position: "absolute", inset: -40,
            background: "radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div className="mock-card" style={{ padding: "28px 32px", textAlign: "left" }}>
            {/* Mock header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Good morning 👋</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>Hey, Niranjan</div>
              </div>
              <div style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                borderRadius: 12, padding: "10px 20px",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>+ Add Expense</div>
            </div>

            {/* Mock stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Total Spent", value: "₹12,480", color: "#60a5fa" },
                { label: "This Month",  value: "₹3,240",  color: "#a78bfa" },
                { label: "Transactions",value: "24",       color: "#34d399" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: 14,
                  padding: "16px 18px", border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Mock expenses */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: "rgba(255,255,255,0.7)" }}>Recent Expenses</div>
              {[
                { note: "Swiggy Order", cat: "Food", amount: "₹349", date: "Today" },
                { note: "Uber Ride", cat: "Transport", amount: "₹124", date: "Yesterday" },
                { note: "Netflix", cat: "Entertainment", amount: "₹499", date: "Apr 20" },
              ].map((e, i) => (
                <div key={i} className="expense-item">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, background: "rgba(99,102,241,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💸</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{e.note}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{e.date}</span>
                        <span style={{ fontSize: 11, color: "#a78bfa", background: "rgba(167,139,250,0.12)", padding: "1px 7px", borderRadius: 99 }}>{e.cat}</span>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#f87171" }}>-{e.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "18px 0",
        overflow: "hidden",
        background: "rgba(255,255,255,0.02)",
      }}>
        <div className="ticker">
          {[...Array(2)].map((_, ri) => (
            ["💸 Track Expenses", "🗂️ Custom Categories", "📊 Live Dashboard", "🎯 Budget Goals", "🔒 Secure & Private", "⚡ Lightning Fast", "💸 Track Expenses", "🗂️ Custom Categories", "📊 Live Dashboard", "🎯 Budget Goals"].map((item, i) => (
              <span key={`${ri}-${i}`} style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>
                {item}
              </span>
            ))
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "120px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div
          id="feat-header"
          data-animate
          className={`reveal ${visible["feat-header"] ? "visible" : ""}`}
          style={{ textAlign: "center", marginBottom: 72 }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: 999, padding: "7px 16px", fontSize: 12,
            color: "#c4b5fd", fontWeight: 500, marginBottom: 20,
          }}>
            ✦ Everything you need
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(36px, 5vw, 58px)",
            fontWeight: 900, lineHeight: 1.1, marginBottom: 18,
          }}>
            Built for people who want<br />
            <span className="gradient-text">clarity over chaos</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 17, maxWidth: 520, margin: "0 auto", fontWeight: 300 }}>
            Every feature is designed to reduce friction between you and understanding your money.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {features.map((f, i) => (
            <div
              key={i}
              id={`feat-${i}`}
              data-animate
              className={`feature-card reveal ${visible[`feat-${i}`] ? "visible" : ""}`}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div style={{ fontSize: 36, marginBottom: 20 }}>{f.icon}</div>
              <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 10, letterSpacing: "-0.3px" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, fontWeight: 300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: "120px 60px", position: "relative", overflow: "hidden" }}>
        <div className="glow-purple" style={{ width: 600, height: 600, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />

        <div
          id="how-header"
          data-animate
          className={`reveal ${visible["how-header"] ? "visible" : ""}`}
          style={{ textAlign: "center", marginBottom: 72, position: "relative" }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(244,114,182,0.1)", border: "1px solid rgba(244,114,182,0.25)",
            borderRadius: 999, padding: "7px 16px", fontSize: 12,
            color: "#f9a8d4", fontWeight: 500, marginBottom: 20,
          }}>
            ✦ Simple by design
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(36px, 5vw, 58px)",
            fontWeight: 900, lineHeight: 1.1,
          }}>
            Up and running in<br />
            <span className="gradient-text">three steps</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 1000, margin: "0 auto", position: "relative" }}>
          {steps.map((s, i) => (
            <div
              key={i}
              id={`step-${i}`}
              data-animate
              className={`step-card reveal ${visible[`step-${i}`] ? "visible" : ""}`}
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              <div style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 52, fontWeight: 900,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                marginBottom: 20, lineHeight: 1,
              }}>{s.num}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, fontWeight: 300 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" style={{ padding: "100px 60px", maxWidth: 1100, margin: "0 auto" }}>
        <div
          id="stats-header"
          data-animate
          className={`reveal ${visible["stats-header"] ? "visible" : ""}`}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 900, lineHeight: 1.1, marginBottom: 16,
          }}>
            Numbers that <span className="gradient-text">speak for themselves</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {stats.map((s, i) => (
            <div
              key={i}
              id={`stat-${i}`}
              data-animate
              className={`stat-card reveal ${visible[`stat-${i}`] ? "visible" : ""}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 52, fontWeight: 900,
                background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                marginBottom: 8,
              }}>{s.value}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ padding: "120px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="glow-blue" style={{ width: 800, height: 800, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />

        <div
          id="cta"
          data-animate
          className={`reveal ${visible["cta"] ? "visible" : ""}`}
          style={{ position: "relative" }}
        >
          {/* Decorative ring */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400, height: 400,
            border: "1px solid rgba(59,130,246,0.15)",
            borderRadius: "50%",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600, height: 600,
            border: "1px solid rgba(139,92,246,0.08)",
            borderRadius: "50%",
            pointerEvents: "none",
          }} />

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 999, padding: "7px 16px", fontSize: 12,
            color: "#93c5fd", fontWeight: 500, marginBottom: 28,
          }}>
            ✦ Free forever, no credit card needed
          </div>

          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 900, lineHeight: 1.05,
            marginBottom: 24, maxWidth: 700, margin: "0 auto 24px",
          }}>
            Ready to own your <span className="gradient-text">finances?</span>
          </h2>

          <p style={{
            fontSize: 18, color: "rgba(255,255,255,0.4)",
            maxWidth: 460, margin: "0 auto 48px", lineHeight: 1.7, fontWeight: 300,
          }}>
            Join thousands tracking smarter. Set up your account in under a minute.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="btn-primary"
              onClick={() => router.push("/register")}
              style={{ padding: "18px 48px", fontSize: 17 }}
            >
              Create free account →
            </button>
            <button
              className="btn-ghost"
              onClick={() => router.push("/login")}
              style={{ padding: "18px 48px", fontSize: 17 }}
            >
              Sign in instead
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "40px 60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
        background: "rgba(255,255,255,0.01)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💸</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>ExpenseTrack</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
          © 2026 ExpenseTrack. Built with Next.js & Prisma.
        </p>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="/login" className="nav-link" style={{ fontSize: 13 }}>Login</a>
          <a href="/register" className="nav-link" style={{ fontSize: 13 }}>Register</a>
        </div>
      </footer>
    </div>
  );
}