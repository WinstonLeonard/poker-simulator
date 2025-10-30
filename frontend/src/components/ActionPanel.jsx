import React, { useState, useEffect } from "react";

const ActionPanel = ({
  player,
  amountToCall,
  minBet,
  minRaise,
  onFold,
  onCheck,
  onCall,
  onBet,
  onAllIn,
}) => {
  const [betAmount, setBetAmount] = useState(minRaise);

  useEffect(() => {
    setBetAmount(minRaise);
  }, [minRaise]);

  const canCheck = amountToCall === 0;
  const isShortStack = player.money < minRaise;
  const hasReachedRaiseLimit = player.raiseTimes >= 1; // ✅ new condition

  // --- SHORT STACK SCENARIO ---
  if (isShortStack) {
    return (
      <div className="w-full max-w-2xl bg-slate-700/80 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col items-center gap-4">
        <h2 className="text-white font-bold text-lg sm:text-xl text-center">
          Not enough chips to meet the minimum raise!
        </h2>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onFold}
            className="py-2 px-4 sm:py-3 sm:px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-md sm:text-lg rounded-lg shadow-lg transition-transform active:scale-95"
          >
            Fold
          </button>
          <button
            onClick={onAllIn}
            className="py-2 px-4 sm:py-3 sm:px-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-md sm:text-lg rounded-lg shadow-lg transition-transform active:scale-95"
          >
            All In (${player.money})
          </button>
        </div>
      </div>
    );
  }

  // --- NORMAL SCENARIO ---
  return (
    <div className="w-full max-w-2xl bg-slate-700/80 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col gap-4">
      {/* Bet Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-white font-bold text-md sm:text-lg">
            {amountToCall > 0 ? "Raise Amount" : "Bet Amount"}
          </span>
          <span className="text-white font-bold text-xl sm:text-2xl font-mono bg-slate-900 px-3 py-1 sm:px-4 sm:py-1 rounded-lg">
            ${betAmount}
          </span>
        </div>

        <input
          type="range"
          min={minRaise}
          max={player.money}
          step="5"
          value={betAmount}
          onChange={(e) => setBetAmount(parseInt(e.target.value))}
          className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          disabled={hasReachedRaiseLimit} // ✅ disable slider
        />

        <div className="flex justify-between text-xs text-slate-400">
          <span>${minRaise} (Min Raise)</span>
          <span>${player.money} (All-in)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={onFold}
          className="py-2 px-3 sm:py-3 sm:px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-md sm:text-lg rounded-lg shadow-lg transition-transform active:scale-95"
        >
          Fold
        </button>

        {canCheck ? (
          <button
            onClick={onCheck}
            className="py-2 px-3 sm:py-3 sm:px-4 bg-gray-500 hover:bg-gray-600 text-white font-bold text-md sm:text-lg rounded-lg shadow-lg transition-transform active:scale-95"
          >
            Check
          </button>
        ) : (
          <button
            onClick={onCall}
            className="py-2 px-3 sm:py-3 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-md sm:text-lg rounded-lg shadow-lg transition-transform active:scale-95"
          >
            Call ${amountToCall}
          </button>
        )}

        <button
          onClick={() => onBet(betAmount)}
          disabled={hasReachedRaiseLimit}
          className={`col-span-2 py-2 px-3 sm:py-3 sm:px-4 font-bold text-md sm:text-lg rounded-lg shadow-lg transition-transform active:scale-95 ${
            hasReachedRaiseLimit
              ? "bg-gray-500 cursor-not-allowed text-gray-300"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          {hasReachedRaiseLimit
            ? "Raise Limit Reached"
            : `${amountToCall > 0 ? "Raise to" : "Bet"}: $${betAmount}`}
        </button>
      </div>
    </div>
  );
};

export default ActionPanel;
