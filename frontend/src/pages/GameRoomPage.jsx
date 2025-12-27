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
  const [splitAmounts, setSplitAmounts] = useState({});
  const [splitError, setSplitError] = useState("");

  useEffect(() => {
    if (!socket || !roomId) return;

    // Ask the server for the latest state immediately on mount
    socket.emit("requestGameState", roomId);

    // Handle server-sent updates
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

    const handleSplitPotError = (payload) => {
      const message =
        typeof payload === "string"
          ? payload
          : payload?.message || "Split failed.";
      setSplitError(message);
    };

    // Handle reconnects
    const handleReconnect = () => {
      console.log("Reconnected, requesting latest game state...");
      socket.emit("reconnectAndRequestGameState", roomId);
    };

    // Handle tab visibility (mobile app switch / tab switch)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Tab visible again, requesting latest game state...");
        socket.emit("reconnectAndRequestGameState", roomId);
      }
    };

    // Register all listeners
    socket.on("preflop", handlePreflop);
    socket.on("gameStateChange", handleGameStateChange);
    socket.on("backToLobby", handleBackToLobby);
    socket.on("splitPotError", handleSplitPotError);
    socket.on("reconnect", handleReconnect);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up on unmount
    return () => {
      socket.off("preflop", handlePreflop);
      socket.off("gameStateChange", handleGameStateChange);
      socket.off("backToLobby", handleBackToLobby);
      socket.off("splitPotError", handleSplitPotError);
      socket.off("reconnect", handleReconnect);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [socket, roomId]);

  // --- Extract data from gameState ---
  const {
    players = [],
    dealerId,
    currentPlayerTurnId,
    pot = 0,
    currentHighestBet = 0,
    gameStage,
  } = gameState ?? {};

  const isShowdown = gameStage === "SHOWDOWN";

  useEffect(() => {
    if (!gameMaster || !isShowdown) return;
    setSplitAmounts((prev) => {
      let changed = false;
      const next = { ...prev };
      players.forEach((player) => {
        if (next[player.id] == null) {
          next[player.id] = 0;
          changed = true;
        }
      });
      Object.keys(next).forEach((playerId) => {
        if (!players.some((player) => player.id === playerId)) {
          delete next[playerId];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [gameMaster, isShowdown, players]);

  // --- Early return while waiting for data ---
  if (!gameState) {
    return (
      <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[120px]" />
          <div className="absolute bottom-[-140px] right-[-120px] h-[360px] w-[360px] rounded-full bg-amber-300/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.4),_transparent_55%)]" />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 text-center">
          <div className="fade-up rounded-3xl border border-white/10 bg-slate-900/70 px-6 py-8 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              Connecting
            </p>
            <h2 className="mt-2 text-2xl font-semibold font-display">
              Waiting for game state...
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Syncing the latest hand from the table.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Derived values ---
  const heroPlayer = players.find((p) => p.id === id);
  const isHeroTurn = currentPlayerTurnId === id;
  const opponents = players.filter((p) => p.id !== id);
  const dealerPlayer = players.find((p) => p.id === dealerId);
  const activePlayers = players.filter((p) => p.status !== "folded");
  const showdownCandidates = players;
  const amountToCall =
    (heroPlayer ? currentHighestBet - heroPlayer.currentBets : 0) || 0;
  const isPreflop = gameStage === "PREFLOP";
  const isPreflopBigBlind =
    isPreflop &&
    heroPlayer &&
    amountToCall === 0 &&
    currentHighestBet > 0 &&
    heroPlayer.currentBets === currentHighestBet;
  const showHero = !gameMaster && heroPlayer;
  const hasDockedAction = showHero && isHeroTurn && !isShowdown;
  const pagePadding = hasDockedAction ? "pb-32 sm:pb-12" : "pb-12";

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
    const maxBet = heroPlayer?.money ?? 0;
    if (!Number.isFinite(amount) || amount <= 0 || amount > maxBet) {
      return;
    }
    const action = amountToCall > 0 || isPreflopBigBlind ? "Raise" : "Bet";
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
  const handleSplitAmountChange = (playerId, value) => {
    const nextValue = Math.max(0, Math.floor(Number(value) || 0));
    setSplitAmounts((prev) => ({
      ...prev,
      [playerId]: nextValue,
    }));
    if (splitError) {
      setSplitError("");
    }
  };
  const handleEvenSplit = () => {
    if (showdownCandidates.length === 0) return;
    const base = Math.floor(pot / showdownCandidates.length);
    const remainder = pot - base * showdownCandidates.length;
    const next = {};
    showdownCandidates.forEach((player, index) => {
      next[player.id] = base + (index === 0 ? remainder : 0);
    });
    setSplitAmounts(next);
    if (splitError) {
      setSplitError("");
    }
  };
  const handleClearSplit = () => {
    const next = {};
    showdownCandidates.forEach((player) => {
      next[player.id] = 0;
    });
    setSplitAmounts(next);
    if (splitError) {
      setSplitError("");
    }
  };
  const handleSplitPot = () => {
    if (!isSplitValid) return;
    if (splitError) {
      setSplitError("");
    }
    const splits = showdownCandidates.map((player) => ({
      playerId: player.id,
      amount: Number(splitAmounts[player.id] || 0),
    }));
    socket.emit("splitPot", roomId, splits);
  };
  const totalSplit = Object.values(splitAmounts).reduce(
    (sum, amount) => sum + (Number(amount) || 0),
    0
  );
  const splitRemaining = pot - totalSplit;
  const isSplitValid = splitRemaining === 0 && pot > 0;
  const splitRemainingTone =
    splitRemaining === 0
      ? "text-emerald-200"
      : splitRemaining < 0
      ? "text-rose-200"
      : "text-amber-200";

  // --- UI ---
  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[120px]" />
        <div className="absolute bottom-[-140px] right-[-120px] h-[360px] w-[360px] rounded-full bg-amber-300/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.45),_transparent_55%)]" />
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(transparent_1px,rgba(148,163,184,0.12)_1px)] [background-size:26px_26px]" />
      </div>

      <div
        className={`relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 pt-8 font-body md:px-8 ${pagePadding}`}
      >
        <section className="fade-up rounded-3xl border border-white/10 bg-slate-900/70 px-5 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
                Game Room
              </p>
              <h1 className="mt-1 text-2xl font-semibold font-display sm:text-3xl">
                Table {roomId}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${
                  gameMaster
                    ? "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/40"
                    : "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/40"
                }`}
              >
                {gameMaster ? "Game Master" : "Player"}
              </span>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                  Players
                </span>
                <span className="text-lg font-semibold">
                  {players.length}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              <span>Live hand</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.7)]" />
              <span>Dealer: {dealerPlayer?.name ?? "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span>
                Highest bet: ${currentHighestBet.toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        <div
          className={`grid gap-6 lg:gap-8 ${
            showHero
              ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
              : ""
          }`}
        >
          <div className="flex flex-col gap-6">
            {/* --- Opponents Area --- */}
            <section
              className="fade-up rounded-3xl border border-white/10 bg-slate-900/50 px-5 py-6 backdrop-blur"
              style={{ animationDelay: "120ms" }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
                    Opponents
                  </p>
                  <h2 className="mt-1 text-lg font-semibold font-display">
                    Seated Players
                  </h2>
                </div>
                <span className="text-xs text-slate-400">
                  {opponents.length} seated
                </span>
              </div>

              <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
                {opponents.map((player) => (
                  <PlayerDisplay
                    key={player.id}
                    player={player}
                    isDealer={player.id === dealerId}
                    isTheirTurn={player.id === currentPlayerTurnId}
                    currentBet={player.currentBets}
                  />
                ))}
                {opponents.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-950/40 px-6 py-5 text-center text-sm text-slate-400">
                    Waiting for more players to join the table.
                  </div>
                )}
              </div>
            </section>

            {/* --- Table Center (Stage + Pot) --- */}
            <section
              className="fade-up relative overflow-hidden rounded-[36px] border border-emerald-400/30 bg-emerald-950/40 px-6 py-8 shadow-[0_25px_80px_-40px_rgba(16,185,129,0.7)]"
              style={{ animationDelay: "220ms" }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_60%)]" />
              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.45em] text-slate-300">
                    Current Stage
                  </span>
                  <h3
                    className={`mt-2 text-3xl font-semibold font-display sm:text-4xl ${
                      isShowdown ? "text-rose-300" : "text-emerald-200"
                    }`}
                  >
                    {gameStage}
                  </h3>
                </div>

                <div className="rounded-3xl border border-amber-300/40 bg-slate-900/70 px-8 py-6 text-center shadow-[0_20px_60px_-30px_rgba(251,191,36,0.6)]">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.5em] text-slate-400">
                    Total Pot
                  </span>
                  <h2 className="mt-2 text-4xl font-semibold font-display text-amber-200 sm:text-5xl">
                    ${pot.toLocaleString()}
                  </h2>
                </div>

                <div className="grid w-full max-w-2xl grid-cols-2 gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-center">
                    <p className="text-[9px] uppercase tracking-[0.35em] text-slate-400">
                      Active
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-100 sm:text-base">
                      {activePlayers.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-center">
                    <p className="text-[9px] uppercase tracking-[0.35em] text-slate-400">
                      High Bet
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-100 sm:text-base">
                      ${currentHighestBet.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-center sm:col-span-1">
                    <p className="text-[9px] uppercase tracking-[0.35em] text-slate-400">
                      To Call
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-100 sm:text-base">
                      {heroPlayer
                        ? `$${amountToCall.toLocaleString()}`
                        : "--"}
                    </p>
                  </div>
                </div>

                {/* Player SHOWDOWN banner */}
                {!gameMaster && isShowdown && (
                  <div className="mt-2 w-full max-w-xl rounded-2xl border border-rose-400/30 bg-rose-500/10 px-6 py-4 text-center shadow-[0_18px_50px_-30px_rgba(244,63,94,0.6)]">
                    <p className="text-xs uppercase tracking-[0.35em] text-rose-200">
                      Showdown
                    </p>
                    <p className="mt-2 text-sm text-slate-100 sm:text-base">
                      Waiting for the game master to select the winner.
                    </p>
                    <p className="mt-2 text-xs text-slate-300">
                      Actions are disabled for all players.
                    </p>
                  </div>
                )}

                {/* Game Master SHOWDOWN controls */}
                {gameMaster && isShowdown && (
                  <div className="mt-2 w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-semibold text-rose-200">
                          Showdown Controls
                        </h4>
                        <p className="text-xs text-slate-300">
                          Select the winner to award the pot.
                        </p>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                        Game Master
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {showdownCandidates.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleAwardPot(p.id)}
                          className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-left transition hover:border-emerald-300/60 hover:bg-slate-900"
                        >
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold">
                              {p.name ?? p.id}
                            </span>
                            <span className="text-xs text-slate-400">
                              {p.status || "active"}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-200 group-hover:text-emerald-100">
                            Award
                          </span>
                        </button>
                      ))}
                    </div>

                    {showdownCandidates.length === 0 && (
                      <div className="mt-4 text-center text-sm text-slate-400">
                        No eligible players to award (all folded?). You can still
                        handle this on the backend.
                      </div>
                    )}

                    {showdownCandidates.length > 0 && (
                      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h5 className="text-sm font-semibold text-slate-100">
                              Split Pot
                            </h5>
                            <p className="text-xs text-slate-400">
                              Assign amounts per player. Total must equal the pot.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={handleEvenSplit}
                              className="rounded-full border border-emerald-400/40 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:border-emerald-300 hover:text-emerald-100"
                            >
                              Even split
                            </button>
                            <button
                              type="button"
                              onClick={handleClearSplit}
                              className="rounded-full border border-slate-500/50 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-slate-400 hover:text-slate-100"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-3">
                          {showdownCandidates.map((player) => (
                            <div
                              key={player.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2"
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-100">
                                  {player.name ?? player.id}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {player.status || "active"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>Assign</span>
                                <input
                                  type="number"
                                  min="0"
                                  inputMode="numeric"
                                  value={splitAmounts[player.id] ?? 0}
                                  onChange={(event) =>
                                    handleSplitAmountChange(
                                      player.id,
                                      event.target.value
                                    )
                                  }
                                  className="w-24 rounded-lg border border-white/10 bg-slate-950/70 px-2 py-1 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:ring-emerald-400/50"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-slate-400">
                            Assigned ${totalSplit.toLocaleString()} / $
                            {pot.toLocaleString()}
                          </span>
                          <span className={splitRemainingTone}>
                            Remaining ${splitRemaining.toLocaleString()}
                          </span>
                        </div>
                        {splitError && (
                          <div className="mt-2 text-xs text-rose-300">
                            {splitError}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleSplitPot}
                          disabled={!isSplitValid}
                          className={`mt-4 w-full rounded-xl px-4 py-2 text-sm font-semibold shadow transition ${
                            isSplitValid
                              ? "bg-emerald-500/90 text-white hover:bg-emerald-500"
                              : "cursor-not-allowed bg-slate-700 text-slate-400"
                          }`}
                        >
                          Confirm Split
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* --- Hero (You) Area --- */}
          {showHero && (
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <section
                className="fade-up rounded-3xl border border-white/10 bg-slate-900/60 px-5 py-6 backdrop-blur"
                style={{ animationDelay: "320ms" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
                      Your Seat
                    </p>
                    <h2 className="mt-1 text-lg font-semibold font-display">
                      {heroPlayer.name}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] ${
                      isHeroTurn
                        ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/40"
                        : "bg-slate-700/60 text-slate-300 ring-1 ring-slate-500/40"
                    }`}
                  >
                    {isHeroTurn ? "Your Turn" : "Waiting"}
                  </span>
                </div>

                <div className="mt-4 flex flex-col items-center gap-4 sm:gap-6">
              <PlayerDisplay
                player={heroPlayer}
                isDealer={heroPlayer.id === dealerId}
                isTheirTurn={isHeroTurn}
                currentBet={heroPlayer.currentBets}
                variant="hero"
              />

                  {isHeroTurn && !isShowdown && (
                    <div className="fixed inset-x-4 bottom-4 z-30 sm:static sm:inset-auto sm:bottom-auto sm:z-auto">
                      <div className="mx-auto max-w-2xl">
                        <ActionPanel
                          player={heroPlayer}
                          amountToCall={amountToCall}
                          minBet={10}
                          minRaise={2 * currentHighestBet}
                          forceRaise={isPreflopBigBlind}
                          onFold={handleFold}
                          onCheck={handleCheck}
                          onCall={handleCall}
                          onBet={handleBet}
                          onAllIn={handleAllIn}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameRoomPage;
