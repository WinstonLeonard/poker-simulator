import React, { useState, useEffect } from "react";

// --- PlayerDisplay Component ---
// Shows a player's avatar, name, money, and status

const PlayerDisplay = ({ player, isDealer, isTheirTurn, currentBet }) => {
  const isFolded = player.status === "folded";
  const isActive = isTheirTurn && !isFolded;

  // Determine status message
  let statusMessage = player.status;
  if (isActive) statusMessage = "THINKING...";

  return (
    <div
      className={`relative mt-5 bg-slate-700 p-3 sm:p-4 rounded-xl shadow-lg transition-all duration-300 min-w-[180px] ${
        isFolded ? "opacity-40" : ""
      } ${
        isActive
          ? "ring-4 ring-cyan-400 shadow-cyan-500/50"
          : "ring-2 ring-slate-600"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-600 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl text-white flex-shrink-0">
          {player.name.charAt(0)}
        </div>
        {/* Info */}
        <div>
          <h3 className="text-md sm:text-lg font-bold text-white">
            {player.name}
          </h3>
          <p className="text-sm sm:text-md text-emerald-400 font-semibold">
            ${player.money.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      {player.status !== "" && (
        <span
          className={`absolute -top-3 -right-3 text-white text-xs font-bold px-3 py-1 rounded-full uppercase ${
            !isFolded ? "bg-cyan-500" : "bg-gray-500"
          }`}
        >
          {player.status}
        </span>
      )}

      {/* Dealer Badge */}
      {isDealer && (
        <span className="absolute -bottom-3 -left-3 w-7 h-7 sm:w-8 sm:h-8 bg-amber-400 text-black text-xs sm:text-sm font-bold flex items-center justify-center rounded-full shadow-md border-2 border-slate-900">
          D
        </span>
      )}

      {/* Current Bet */}
      {currentBet > 0 && (
        <div className="absolute -bottom-4 right-2 bg-slate-900 border-2 border-amber-400 rounded-full px-2 py-0.5 sm:px-3 sm:py-1">
          <span className="text-xs sm:text-sm font-bold text-amber-400">
            Bet: ${currentBet}
          </span>
        </div>
      )}
    </div>
  );
};

export default PlayerDisplay;
