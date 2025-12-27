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
  const minAllowed = amountToCall > 0 ? minRaise : minBet;
  const [betAmount, setBetAmount] = useState(minAllowed);

  useEffect(() => {
    setBetAmount(minAllowed);
  }, [minAllowed]);

  const canCheck = amountToCall === 0;
  const cannotCall = amountToCall > player.money;
  const hasReachedRaiseLimit = player.raiseTimes >= 1;
  const notEnoughToRaise = minRaise > player.money;

  if (cannotCall) {
    return (
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur">
        <h2 className="text-center text-lg font-semibold text-white font-display sm:text-xl">
          You don't have enough to call (${amountToCall}). You may go all-in.
        </h2>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            onClick={onFold}
            className="rounded-xl bg-rose-500/90 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-500 active:scale-95 sm:px-6 sm:py-3"
          >
            Fold
          </button>
          <button
            onClick={onAllIn}
            className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 shadow transition hover:bg-amber-200 active:scale-95 sm:px-6 sm:py-3"
          >
            All In (${player.money})
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-200 sm:text-base">
            {amountToCall > 0 ? "Raise Amount" : "Bet Amount"}
          </span>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/40">
            Stack ${player.money.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            {amountToCall > 0 ? "To call" : "Min bet"}: $
            {(amountToCall > 0 ? amountToCall : minBet).toLocaleString()}
          </span>
          <span className="rounded-xl bg-slate-950/70 px-4 py-1 text-lg font-semibold text-emerald-200">
            ${betAmount}
          </span>
        </div>

        <input
          type="range"
          min={minAllowed}
          max={player.money}
          step="5"
          value={betAmount}
          onChange={(e) => setBetAmount(parseInt(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-400"
          disabled={hasReachedRaiseLimit}
        />

        <div className="flex justify-between text-[11px] text-slate-400">
          <span>
            ${minAllowed} {amountToCall > 0 ? "min raise" : "min bet"}
          </span>
          <span>${player.money} all-in</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <button
          onClick={onFold}
          className="rounded-xl bg-rose-500/90 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-500 active:scale-95 sm:px-4 sm:py-3"
        >
          Fold
        </button>

        {canCheck ? (
          <button
            onClick={onCheck}
            className="rounded-xl bg-slate-600/80 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-600 active:scale-95 sm:px-4 sm:py-3"
          >
            Check
          </button>
        ) : (
          <button
            onClick={onCall}
            className="rounded-xl bg-sky-500/90 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-500 active:scale-95 sm:px-4 sm:py-3"
          >
            Call ${amountToCall}
          </button>
        )}

        <button
          onClick={() => onBet(betAmount)}
          disabled={hasReachedRaiseLimit || notEnoughToRaise}
          className={`col-span-2 rounded-xl px-3 py-2 text-sm font-semibold shadow transition active:scale-95 sm:px-4 sm:py-3 ${
            hasReachedRaiseLimit || notEnoughToRaise
              ? "cursor-not-allowed bg-slate-700 text-slate-400"
              : "bg-emerald-500/90 text-white hover:bg-emerald-500"
          }`}
        >
          {hasReachedRaiseLimit
            ? "Cannot raise anymore"
            : `${amountToCall > 0 ? "Raise to" : "Bet"}: $${betAmount}`}
        </button>
      </div>
    </div>
  );
};

export default ActionPanel;
