import React from "react";

// --- PlayerDisplay Component ---
// Shows a player's avatar, name, money, and status

const PlayerDisplay = ({
  player,
  isDealer,
  isTheirTurn,
  currentBet,
  variant,
}) => {
  const isFolded = player.status === "folded";
  const isActive = isTheirTurn && !isFolded;
  const displayName = player.name ?? "Player";
  const statusLabel = isActive ? "THINKING..." : player.status;
  const showStatus = statusLabel && statusLabel !== "";
  const isHero = variant === "hero";

  return (
    <div
      className={`relative rounded-2xl border border-white/10 bg-slate-900/70 p-4 pb-6 pt-5 shadow-lg backdrop-blur transition-all duration-300 ${
        isFolded ? "opacity-40" : "opacity-100"
      } ${
        isActive
          ? "ring-2 ring-emerald-300/70 shadow-emerald-500/30"
          : "ring-1 ring-white/10"
      } ${
        isHero
          ? "w-full lg:min-h-[130px] lg:min-w-[320px] lg:w-full lg:p-6 lg:pb-7 lg:pt-6"
          : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 text-base font-semibold text-white shadow ${
            isHero ? "lg:h-14 lg:w-14 lg:text-lg" : ""
          }`}
        >
          {displayName.charAt(0)}
        </div>
        <div>
          <h3
            className={`text-base font-semibold text-white font-display ${
              isHero ? "lg:text-lg" : ""
            }`}
          >
            {displayName}
          </h3>
          <p
            className={`text-sm font-semibold text-emerald-300 ${
              isHero ? "lg:text-base" : ""
            }`}
          >
            ${player.money.toLocaleString()}
          </p>
        </div>
      </div>

      {showStatus && (
        <span
          className={`absolute right-3 top-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white ${
            !isFolded ? "bg-emerald-500/90" : "bg-slate-500/90"
          } ${isHero ? "lg:text-xs" : ""}`}
        >
          {statusLabel}
        </span>
      )}

      {isDealer && (
        <span
          className={`absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-amber-300 text-xs font-bold text-slate-950 shadow ${
            isHero ? "lg:h-9 lg:w-9 lg:text-sm" : ""
          }`}
        >
          D
        </span>
      )}

      {currentBet > 0 && (
        <div
          className={`absolute bottom-2 right-2 rounded-full border border-amber-300/60 bg-slate-950/80 px-3 py-1 ${
            isHero ? "lg:px-4" : ""
          }`}
        >
          <span
            className={`text-[11px] font-semibold text-amber-200 ${
              isHero ? "lg:text-sm" : ""
            }`}
          >
            Bet: ${currentBet}
          </span>
        </div>
      )}
    </div>
  );
};

export default PlayerDisplay;
