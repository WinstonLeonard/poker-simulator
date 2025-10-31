import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { usePlayer } from "../context/PlayerProvider";
import PlayerDisplay from "../components/PlayerDisplay";
import ActionPanel from "../components/ActionPanel";

// --- Main Game Room Page ---
function GameRoomPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { socket, gameMaster, id } = usePlayer();

  // --- GAME STATE FROM BACKEND ---
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    if (!socket || !roomId) return;

    // 1️⃣ Ask the server for the latest state immediately on mount
    socket.emit("requestGameState", roomId);

    // 2️⃣ Handle server-sent updates
    const handlePreflop = (gameStateData) => {
      console.log("Received Game State (preflop):", gameStateData);
      setGameState(gameStateData);
    };

    const handleGameStateChange = (gameStateData) => {
      console.log("Received Game State (change):", gameStateData);
      setGameState(gameStateData);
    };

    const handleBackToLobby = () => {
      console.log("Navigating back to lobby...");
      navigate(`/lobby/${roomId}`);
    };

    // 3️⃣ Handle reconnects
    const handleReconnect = () => {
      console.log("🔄 Reconnected, requesting latest game state...");
      socket.emit("requestGameState", roomId);
    };

    // 4️⃣ Handle tab visibility (mobile app switch / tab switch)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("🔄 Tab visible again, requesting latest game state...");
        socket.emit("requestGameState", roomId);
      }
    };

    // ✅ Register all listeners
    socket.on("preflop", handlePreflop);
    socket.on("gameStateChange", handleGameStateChange);
    socket.on("backToLobby", handleBackToLobby);
    socket.on("reconnect", handleReconnect);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 🧹 Clean up on unmount
    return () => {
      socket.off("preflop", handlePreflop);
      socket.off("gameStateChange", handleGameStateChange);
      socket.off("backToLobby", handleBackToLobby);
      socket.off("reconnect", handleReconnect);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [socket, roomId]);

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
  const amountToCall =
    (heroPlayer ? currentHighestBet - heroPlayer.currentBets : 0) || 0;
  const isShowdown = gameStage === "SHOWDOWN";

  // --- Action Handlers ---
  const handleFold = () => {
    console.log("Hero Folds");
    socket.emit("fold", roomId, id);
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
    const action = amountToCall > 0 ? "Raise" : "Bet";
    console.log(`Hero ${action}s $${amount}`);
    socket.emit("betOrRaise", roomId, id, amount, action);
  };

  const handleAllIn = () => {
    const amountToCall = Math.max(
      0,
      currentHighestBet - (heroPlayer?.currentBets ?? 0)
    );
    if ((heroPlayer?.money ?? 0) >= amountToCall) {
      // Not allowed by rule; guard on frontend too
      return;
    }
    socket.emit("all-in", roomId, id);
  };

  // --- Game Master: Award Pot ---

  const handleAwardPot = (winnerId) => {
    socket.emit("awardPot", roomId, winnerId);
  };
  // Helper: candidates visible to GM at showdown (non-folded players by default)
  const showdownCandidates = players; // show all players at SHOWDOWN

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
          <h3
            className={`text-2xl sm:text-3xl font-bold mt-1 ${
              isShowdown ? "text-rose-400" : "text-emerald-400"
            }`}
          >
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

        {/* Player SHOWDOWN banner */}
        {!gameMaster && isShowdown && (
          <div className="mt-6 bg-slate-800/70 backdrop-blur rounded-xl px-6 py-4 border border-slate-700 text-center max-w-xl">
            <p className="text-sm text-slate-300 uppercase tracking-widest">
              SHOWDOWN
            </p>
            <p className="text-base sm:text-lg text-slate-200 mt-1">
              Waiting for game master to select the winner…
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Actions are disabled for all players.
            </p>
          </div>
        )}

        {/* Game Master SHOWDOWN controls */}
        {gameMaster && isShowdown && (
          <div className="mt-6 w-full max-w-2xl bg-slate-800/80 backdrop-blur rounded-2xl p-5 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-rose-300">
                Showdown Controls
              </h4>
              <span className="text-xs text-slate-400 uppercase tracking-widest">
                Game Master Only
              </span>
            </div>

            <p className="text-sm text-slate-300 mb-3">
              Select the winner to award the pot.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {showdownCandidates.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAwardPot(p.id)}
                  className="flex items-center justify-between w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 hover:bg-slate-900 transition shadow"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">
                      {p.name ?? p.id}
                    </span>
                    <span className="text-xs text-slate-400">
                      {p.status || "active"}
                    </span>
                  </div>
                  <span className="text-xs text-emerald-300">Award Pot →</span>
                </button>
              ))}
            </div>

            {showdownCandidates.length === 0 && (
              <div className="text-center text-slate-400 text-sm mt-3">
                No eligible players to award (all folded?). You can still handle
                this on the backend.
              </div>
            )}
          </div>
        )}
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

          {/* Action Panel: Only when it's your turn AND NOT SHOWDOWN */}
          {isHeroTurn && !isShowdown && (
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
