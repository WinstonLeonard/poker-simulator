import React from "react";

const PlayerCard = ({ player }) => {
  const displayName = player.name ?? "Player";

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg backdrop-blur transition hover:border-emerald-300/40">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 text-base font-semibold text-white shadow">
            {displayName.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-semibold text-white font-display">
              {displayName}
            </h3>
            <p className="text-sm font-semibold text-emerald-300">
              ${player.money.toLocaleString()}
            </p>
          </div>
        </div>
        {player.dealer && (
          <span className="rounded-full bg-amber-300/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900">
            Dealer
          </span>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
