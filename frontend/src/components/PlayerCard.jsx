import React from "react";

const PlayerCard = ({ player }) => {
  return (
    <div className="w-full bg-slate-800 rounded-xl shadow-lg p-5 transform transition-all hover:scale-[1.03] hover:shadow-cyan-500/20">
      <div className="flex items-center justify-between">
        {/* Left Side: Icon, Name, Money */}
        <div className="flex items-center gap-4">
          {/* User Icon */}
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-cyan-600 rounded-full">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          </div>

          {/* Name and Money */}
          <div>
            <h3 className="text-xl font-bold text-white">{player.name}</h3>
            <p className="text-md text-emerald-400 font-semibold">
              ${player.money.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Right Side: Dealer Badge (Conditional) */}
        {player.dealer && (
          <div className="flex-shrink-0 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
            DEALER
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
