import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { usePlayer } from "../context/PlayerProvider";
import PlayerDisplay from "../components/PlayerDisplay";
import ActionPanel from "../components/ActionPanel";

// --- Main Game Room Page ---
function GameRoomPage() {
  const { roomId } = useParams();
  const { socket, gameMaster, id } = usePlayer();

  // --- GAME STATE FROM BACKEND ---
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    if (!socket || !roomId) return;

    // 1️⃣ Ask the server for the latest state
    socket.emit("requestGameState", roomId);

    // 2️⃣ Listen for the game state when server sends it back
    const handlePreflop = (gameStateData) => {
      console.log("Received Game State:", gameStateData);
      setGameState(gameStateData);
    };

    const handleGameStateChange = (gameStateData) => {
      console.log("Received Game State:", gameStateData);
      setGameState(gameStateData);
    };

    socket.on("preflop", handlePreflop);
    socket.on("gameStateChange", handleGameStateChange);

    // 3️⃣ Clean up listener when unmounting
    return () => {
      socket.off("preflop", handlePreflop);
      socket.off("gameStateChange", handleGameStateChange);
    };
  }, [socket]);

  // --- Early return while waiting for data ---
  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <h2 className="text-xl font-semibold">Waiting for game state...</h2>
      </div>
    );
  }

  // --- Extract data from gameState ---
  const {
    players,
    dealerId,
    currentPlayerTurnId,
    pot,
    currentHighestBet,
    gameStage,
  } = gameState;

  // --- Derived values ---
  const heroPlayer = players.find((p) => p.id === id);
  const isHeroTurn = currentPlayerTurnId === id;
  const opponents = players.filter((p) => p.id !== id);
  const amountToCall = currentHighestBet - heroPlayer?.currentBets;

  // --- Action Handlers ---
  const handleFold = () => {
    console.log("Hero Folds");
    socket.emit("PLAYER_ACTION", { action: "fold" });
  };

  const handleCheck = () => {
    console.log("Hero Checks");
    socket.emit("check", roomId, id);
  };

  const handleCall = () => {
    console.log(`Hero Calls $${amountToCall}`);
    socket.emit("call", roomId, id, amountToCall);
  };

  const handleBet = (amount) => {
    const action = amountToCall > 0 ? "raise" : "bet";
    console.log(`Hero ${action}s $${amount}`);
    socket.emit("PLAYER_ACTION", { action, amount });
  };

  const handleAllIn = () => {
    const action = amountToCall > 0 ? "raise" : "bet";
    console.log(`Hero ${action}s $${amount}`);
    socket.emit("PLAYER_ACTION", { action, amount });
  };

  // --- UI ---
  return (
    <div className="relative bg-slate-900 min-h-screen flex flex-col items-center justify-start sm:justify-between p-4 md:p-8 text-white font-sans overflow-hidden">
      {/* --- Opponents Area --- */}
      <div className="w-full max-w-6xl flex justify-center gap-4 md:gap-8 flex-wrap mt-20 sm:mt-0">
        {opponents.map((player) => (
          <PlayerDisplay
            key={player.id}
            player={player}
            isDealer={player.id === dealerId}
            isTheirTurn={player.id === currentPlayerTurnId}
            currentBet={player.currentBets}
          />
        ))}
      </div>

      {/* --- Table Center (Stage + Pot) --- */}
      <div className="flex flex-col items-center justify-center my-6 sm:my-12">
        {/* Stage Display */}
        <div className="text-center mb-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Current Stage
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
            {gameStage}
          </h3>
        </div>

        {/* Pot Display */}
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
      {!gameMaster && heroPlayer && (
        <div className="w-full max-w-2xl flex flex-col items-center gap-4 sm:gap-6">
          {/* Your own player display */}
          <PlayerDisplay
            player={heroPlayer}
            isDealer={heroPlayer.id === dealerId}
            isTheirTurn={isHeroTurn}
            currentBet={heroPlayer.currentBets}
          />

          {/* Action Panel: Only shows when it's your turn */}
          {isHeroTurn && (
            <ActionPanel
              player={heroPlayer}
              amountToCall={amountToCall}
              minBet={10}
              minRaise={2 * currentHighestBet}
              onFold={handleFold}
              onCheck={handleCheck}
              onCall={handleCall}
              onBet={handleBet}
              onAllIn={handleAllIn}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default GameRoomPage;
