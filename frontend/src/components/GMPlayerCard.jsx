import React, { useState, useEffect } from "react";
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
  const [amount, setAmount] = useState(100); // State for the add/subtract input

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
    <div className="w-full bg-slate-800 rounded-xl shadow-lg p-5">
      {/* Top Section: Player Info */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-cyan-600 rounded-full">
            <UserIcon />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{player.name}</h3>
            <p className="text-md text-emerald-400 font-semibold">
              ${player.money.toLocaleString()}
            </p>
          </div>
        </div>
        {player.dealer && (
          <div className="flex-shrink-0 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
            DEALER
          </div>
        )}
      </div>

      {/* Bottom Section: GM Controls */}
      <div className="pt-4">
        {/* Money Controls */}
        <div className="flex items-stretch gap-2 mb-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 rounded-md text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <GMButton
            onClick={handleAddMoney}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <PlusIcon />
          </GMButton>
          <GMButton
            onClick={handleSubtractMoney}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <MinusIcon />
          </GMButton>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <GMButton
            onClick={() => onSetDealer(player.id)}
            disabled={player.dealer}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-slate-600 disabled:opacity-50"
          >
            Make Dealer
          </GMButton>
          <GMButton
            onClick={() => onRemovePlayer(player.id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
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
