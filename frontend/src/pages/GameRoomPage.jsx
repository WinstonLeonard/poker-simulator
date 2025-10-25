import React, { useState, useEffect } from "react";
// Note: All card-related SVGs and components have been removed.

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
      className={`relative bg-slate-700 p-3 sm:p-4 rounded-xl shadow-lg transition-all duration-300 min-w-[180px] ${
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
      {player.status !== "waiting" && (
        <span
          className={`absolute -top-3 -right-3 text-white text-xs font-bold px-3 py-1 rounded-full uppercase ${
            isActive ? "bg-cyan-500" : "bg-gray-500"
          }`}
        >
          {statusMessage}
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

// --- ActionPanel Component ---
// The control panel for the current player
const ActionPanel = ({
  player,
  amountToCall,
  minBet,
  onFold,
  onCheck,
  onCall,
  onBet,
}) => {
  const [betAmount, setBetAmount] = useState(minBet);

  useEffect(() => {
    // Update bet amount if the minBet changes (e.g., after a raise)
    setBetAmount(minBet);
  }, [minBet]);

  const canCheck = amountToCall === 0;

  return (
    <div className="w-full max-w-2xl bg-slate-700/80 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col gap-4">
      {/* Bet Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-white font-bold text-md sm:text-lg">
            Bet / Raise
          </span>
          <span className="text-white font-bold text-xl sm:text-2xl font-mono bg-slate-900 px-3 py-1 sm:px-4 sm:py-1 rounded-lg">
            ${betAmount}
          </span>
        </div>
        <input
          type="range"
          min={minBet}
          max={player.money}
          step="10"
          value={betAmount}
          onChange={(e) => setBetAmount(parseInt(e.target.value))}
          className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>${minBet} (Min)</span>
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
          className="col-span-2 py-2 px-3 sm:py-3 sm:px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-md sm:text-lg rounded-lg shadow-lg transition-transform active:scale-95"
        >
          {amountToCall > 0 ? "Raise to" : "Bet"}: ${betAmount}
        </button>
      </div>
    </div>
  );
};

// --- NotificationLog Component ---
// Displays a list of recent actions
const NotificationLog = ({ notifications }) => {
  return (
    <div className="absolute top-4 left-4 z-10 w-48 sm:w-64 h-36 sm:h-48 bg-slate-900/50 backdrop-blur-sm rounded-lg p-2 sm:p-3 overflow-hidden shadow-lg">
      <h4 className="text-xs sm:text-sm font-bold text-slate-300 border-b border-slate-700 pb-1 mb-2">
        Action Log
      </h4>
      <div className="flex flex-col-reverse h-full overflow-y-auto pr-2">
        {notifications.map((note, index) => (
          <p key={index} className="text-xs sm:text-sm text-slate-200 mb-1">
            <span className="font-bold text-cyan-400">{note.player}</span>{" "}
            {note.action}
          </p>
        ))}
      </div>
    </div>
  );
};

// --- Main Game Room Page ---

function GameRoomPage() {
  // --- MOCK STATE ---
  // This state would come from your socket/context
  const [players, setPlayers] = useState([
    { id: "1", name: "Alice", money: 980, status: "waiting" },
    { id: "2", name: "Bob", money: 850, status: "folded" },
    { id: "3", name: "Charlie", money: 1100, status: "waiting" },
    { id: "hero", name: "You", money: 750, status: "waiting" },
  ]);
  const [dealerId, setDealerId] = useState("1");
  const [currentPlayerTurnId, setCurrentPlayerTurnId] = useState("hero");
  const [pot, setPot] = useState(150);
  const [currentBets, setCurrentBets] = useState({
    1: 20,
    2: 0,
    3: 50,
    hero: 0,
  });
  const [amountToCall, setAmountToCall] = useState(50); // The highest current bet
  const [minBet, setMinBet] = useState(100); // Minimum raise amount

  const [notifications, setNotifications] = useState([
    { player: "Alice", action: "bets $20" },
    { player: "Bob", action: "folds" },
    { player: "Charlie", action: "raises to $50" },
  ]);
  // --- END MOCK STATE ---

  // Get the current player's data
  const heroPlayer = players.find((p) => p.id === "hero");
  const isHeroTurn = currentPlayerTurnId === "hero";

  // --- Action Handlers ---
  // In a real app, these would emit socket events
  const addNotification = (player, action) => {
    setNotifications((prev) => [{ player, action }, ...prev]);
  };

  const handleFold = () => {
    console.log("Hero Folds");
    addNotification("You", "fold");
    // ... emit socket event, update state ...
  };

  const handleCheck = () => {
    console.log("Hero Checks");
    addNotification("You", "check");
    // ... emit socket event, update state ...
  };

  const handleCall = () => {
    console.log(`Hero Calls $${amountToCall}`);
    addNotification("You", `call $${amountToCall}`);
    // ... emit socket event, update state ...
  };

  const handleBet = (amount) => {
    const action = amountToCall > 0 ? "raises to" : "bets";
    console.log(`Hero ${action} $${amount}`);
    addNotification("You", `${action} $${amount}`);
    // ... emit socket event, update state ...
  };

  // Filter out the hero player to render as "opponents"
  const opponents = players.filter((p) => p.id !== "hero");

  return (
    <div className="relative bg-slate-900 min-h-screen flex flex-col items-center justify-start sm:justify-between p-4 md:p-8 text-white font-sans overflow-hidden">
      {/* <NotificationLog notifications={notifications} /> */}

      {/* --- Opponents Area --- */}
      <div className="w-full max-w-6xl flex justify-center gap-4 md:gap-8 flex-wrap mt-20 sm:mt-0">
        {opponents.map((player) => (
          <PlayerDisplay
            key={player.id}
            player={player}
            isDealer={player.id === dealerId}
            isTheirTurn={player.id === currentPlayerTurnId}
            currentBet={currentBets[player.id] || 0}
          />
        ))}
      </div>

      {/* --- Table Center (Pot) --- */}
      <div className="flex flex-col items-center justify-center my-6 sm:my-12">
        <div className="bg-slate-800 border-4 border-amber-400 rounded-full shadow-2xl py-4 px-8 sm:py-6 sm:px-12">
          <span className="text-sm font-bold text-slate-400 uppercase">
            Total Pot
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-amber-400 font-mono">
            ${pot.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* --- Hero (You) Area --- */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-4 sm:gap-6">
        {/* Your own player display */}
        <PlayerDisplay
          player={heroPlayer}
          isDealer={heroPlayer.id === dealerId}
          isTheirTurn={isHeroTurn}
          currentBet={currentBets[heroPlayer.id] || 0}
        />

        {/* Action Panel: Only shows when it's your turn */}
        {isHeroTurn && (
          <ActionPanel
            player={heroPlayer}
            amountToCall={amountToCall}
            minBet={minBet}
            onFold={handleFold}
            onCheck={handleCheck}
            onCall={handleCall}
            onBet={handleBet}
          />
        )}
      </div>
    </div>
  );
}

export default GameRoomPage;
