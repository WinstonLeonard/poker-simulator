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
  forceRaise = false,
}) => {
  const stack = player.money ?? 0;
  const currentBets = player.currentBets ?? 0;
  const roundStartMoneyValue =
    player.roundStartMoney != null ? Number(player.roundStartMoney) : NaN;
  const roundStartMoney = Number.isFinite(roundStartMoneyValue)
    ? roundStartMoneyValue
    : stack + currentBets;
  const isRaiseAction = amountToCall > 0 || forceRaise;
  const minAllowed = isRaiseAction ? minRaise : minBet;
  const maxAllowed = isRaiseAction
    ? Math.max(roundStartMoney, minAllowed)
    : Math.max(stack, minAllowed);
  const [betAmount, setBetAmount] = useState(minAllowed);

  useEffect(() => {
    setBetAmount(minAllowed);
  }, [minAllowed]);

  const canCheck = amountToCall === 0;
  const cannotCall = amountToCall > stack;
  const hasReachedRaiseLimit = player.raiseTimes >= 1;
  const insufficientForMin =
    minAllowed > (isRaiseAction ? roundStartMoney : stack);
  const noChips = stack <= 0;
  const minLabel = isRaiseAction ? "Min raise" : "Min bet";
  const allInLabelAmount = isRaiseAction ? roundStartMoney : stack;
  const callLabel =
    amountToCall > 0
      ? `To call: $${amountToCall.toLocaleString()}`
      : `${minLabel}: $${minAllowed.toLocaleString()}`;

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
            {isRaiseAction ? "Raise Amount" : "Bet Amount"}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/40">
              Stack ${stack.toLocaleString()}
            </span>
            {currentBets > 0 && (
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100 ring-1 ring-amber-400/40">
                Committed ${currentBets.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">{callLabel}</span>
          <span className="rounded-xl bg-slate-950/70 px-4 py-1 text-lg font-semibold text-emerald-200">
            ${betAmount}
          </span>
        </div>

        <input
          type="range"
          min={minAllowed}
          max={maxAllowed}
          step="5"
          value={betAmount}
          onChange={(e) => setBetAmount(parseInt(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-400"
          disabled={hasReachedRaiseLimit || insufficientForMin || noChips}
        />

        <div className="flex justify-between text-[11px] text-slate-400">
          <span>
            ${minAllowed} {isRaiseAction ? "min raise" : "min bet"}
          </span>
          <span>${allInLabelAmount} all-in</span>
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
          disabled={hasReachedRaiseLimit || insufficientForMin || noChips}
          className={`col-span-2 rounded-xl px-3 py-2 text-sm font-semibold shadow transition active:scale-95 sm:px-4 sm:py-3 ${
            hasReachedRaiseLimit || insufficientForMin || noChips
              ? "cursor-not-allowed bg-slate-700 text-slate-400"
              : "bg-emerald-500/90 text-white hover:bg-emerald-500"
          }`}
        >
          {hasReachedRaiseLimit
            ? "Cannot raise anymore"
            : noChips
            ? "No chips left"
            : insufficientForMin
            ? "Insufficient stack"
            : `${isRaiseAction ? "Raise to" : "Bet"}: $${betAmount}`}
        </button>
      </div>
    </div>
  );
};

export default ActionPanel;
