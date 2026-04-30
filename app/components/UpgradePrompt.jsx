"use client";

// ✅ Reusable upgrade prompt — shown when free user hits a limit
// Pass different messages depending on what they tried to do

export default function UpgradePrompt({ message, feature, onClose }) {
  const featureIcons = {
    expenses: "🧾",
    categories: "🗂️",
    budgets: "🎯",
    analytics: "📊",
    export: "📄",
  };

  const icon = featureIcons[feature] || "✨";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-[#13131f] border border-white/10 rounded-3xl p-9 text-center"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modal-in 0.25s ease forwards" }}
      >
        <style>{`
          @keyframes modal-in {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
          {icon}
        </div>

        {/* Crown badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/25 rounded-full px-4 py-1.5 text-amber-300 text-[12px] font-medium mb-4">
          👑 Premium Feature
        </div>

        <h2 className="text-[20px] font-bold text-white mb-3">
          Upgrade to Premium
        </h2>

        <p className="text-white/45 text-[14px] leading-relaxed mb-7">
          {message}
        </p>

        {/* What you get */}
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 mb-7 text-left">
          <p className="text-white/50 text-[11px] font-medium uppercase tracking-widest mb-3">
            Premium includes
          </p>
          {[
            "Unlimited expenses",
            "Unlimited categories",
            "Unlimited budgets",
            "Charts & Analytics",
            "CSV + Excel export",
            "Monthly email reports",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5 py-1.5">
              <span className="text-emerald-400 text-sm">✓</span>
              <span className="text-white/70 text-[13px]">{item}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.href = "/pricing"}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[15px] font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            👑 Upgrade to Premium
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-white/[0.04] border border-white/10 text-white/50 text-[14px] rounded-xl hover:bg-white/[0.08] active:scale-95 transition-all duration-150 cursor-pointer"
          >
            Maybe later
          </button>
        </div>

        <p className="text-white/20 text-[11px] mt-4">
          Coming soon — payment integration
        </p>
      </div>
    </div>
  );
}