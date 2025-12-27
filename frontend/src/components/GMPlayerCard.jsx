import React, { useState } from "react";
import PlusIcon from "../Icons/PlusIcon";
import MinusIcon from "../Icons/MinusIcon";
import TrashIcon from "../Icons/TrashIcon";
import UserIcon from "../Icons/UserIcon";
import GMButton from "./GMButton";

const GMPlayerCard = ({
  player,
  onSetDealer,
  onUpdateMoney,
  onRemovePlayer,
}) => {
  const [amount, setAmount] = useState(100);

  const handleAddMoney = () => {
    const numAmount = parseInt(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      onUpdateMoney(player.id, numAmount);
    }
  };

  const handleSubtractMoney = () => {
    const numAmount = parseInt(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      onUpdateMoney(player.id, -numAmount);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 text-white shadow">
            <UserIcon />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white font-display">
              {player.name}
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

      <div className="pt-4">
        <div className="flex flex-wrap items-stretch gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
          <GMButton
            onClick={handleAddMoney}
            className="bg-emerald-500/90 text-white hover:bg-emerald-500"
          >
            <PlusIcon />
          </GMButton>
          <GMButton
            onClick={handleSubtractMoney}
            className="bg-amber-400/90 text-slate-950 hover:bg-amber-300"
          >
            <MinusIcon />
          </GMButton>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <GMButton
            onClick={() => onSetDealer(player.id)}
            disabled={player.dealer}
            className="flex-1 bg-sky-500/90 text-white hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400"
          >
            Make Dealer
          </GMButton>
          <GMButton
            onClick={() => onRemovePlayer(player.id)}
            className="flex-1 bg-rose-500/90 text-white hover:bg-rose-500"
          >
            <span className="flex items-center justify-center gap-1.5">
              <TrashIcon /> Remove
            </span>
          </GMButton>
        </div>
      </div>
    </div>
  );
};

export default GMPlayerCard;
