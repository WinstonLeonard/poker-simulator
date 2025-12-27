import React, { useState, useEffect } from "react";
import "../App.css";
import { useParams, useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerProvider";
import GMPlayerCard from "../components/GMPlayerCard";
import GMButton from "../components/GMButton";
import { getRoomData } from "../api/api";
import {
  convertPlayersArrayToObject,
  convertPlayersObjectToArray,
} from "../utils/utils";

const LobbyPageGameMaster = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const { socket } = usePlayer();

  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState(0);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const data = await getRoomData(roomId);
        const playersArray = convertPlayersObjectToArray(data.players);
        setPlayers(playersArray);
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };
    fetchRoomData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handlePlayerDataChanged = (roomData) => {
      if (roomData && roomData.players) {
        const playersArray = convertPlayersObjectToArray(roomData.players);
        setPlayers(playersArray);
      }
    };

    const handleGameStart = () => {
      navigate(`/gameroom/${roomId}`);
    };

    socket.on("playerDataChanged", handlePlayerDataChanged);
    socket.on("gameStart", handleGameStart);

    return () => {
      socket.off("playerDataChanged", handlePlayerDataChanged);
      socket.off("gameStart", handleGameStart);
    };
  }, [socket, roomId, navigate]);

  useEffect(() => {
    if (players.length > 1) {
      setTransferFrom(players[0].id);
      setTransferTo(players[1].id);
    }
  }, [players]);

  const handleSetDealer = (playerId) => {
    const updatedPlayers = players.map((p) => ({
      ...p,
      dealer: p.id === playerId,
    }));
    setPlayers(updatedPlayers);
    socket.emit(
      "playerDataChange",
      roomId,
      convertPlayersArrayToObject(updatedPlayers)
    );
  };

  const handleRemovePlayer = (playerId) => {
    const updatedPlayers = players.filter((p) => p.id !== playerId);
    setPlayers(updatedPlayers);
    socket.emit(
      "playerDataChange",
      roomId,
      convertPlayersArrayToObject(updatedPlayers)
    );
  };

  const handleUpdateMoney = (playerId, amount) => {
    const numAmount = parseInt(amount);
    if (isNaN(numAmount)) return;
    const updatedPlayers = players.map((p) => {
      if (p.id === playerId) {
        const newMoney = p.money + numAmount;
        return { ...p, money: newMoney < 0 ? 0 : newMoney };
      }
      return p;
    });
    setPlayers(updatedPlayers);
    socket.emit(
      "playerDataChange",
      roomId,
      convertPlayersArrayToObject(updatedPlayers)
    );
  };

  const handleTransferMoney = () => {
    const numAmount = parseInt(transferAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      console.warn("Please enter a valid amount to transfer.");
      return;
    }
    if (transferFrom === transferTo) {
      console.warn("Cannot transfer money to the same player.");
      return;
    }
    const fromPlayer = players.find((p) => p.id === transferFrom);
    if (fromPlayer.money < numAmount) {
      console.warn(`${fromPlayer.name} does not have enough money.`);
      return;
    }
    const updatedPlayers = players.map((p) => {
      if (p.id === transferFrom) {
        return { ...p, money: p.money - numAmount };
      }
      if (p.id === transferTo) {
        return { ...p, money: p.money + numAmount };
      }
      return p;
    });
    setPlayers(updatedPlayers);
    socket.emit(
      "playerDataChange",
      roomId,
      convertPlayersArrayToObject(updatedPlayers)
    );
    setTransferAmount(0);
  };

  const handleStartGame = () => {
    socket.emit("gameStart", roomId);
  };

  const handleEndRoom = () => {
    console.log("Attempting to end room...");
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[120px]" />
        <div className="absolute bottom-[-140px] right-[-120px] h-[360px] w-[360px] rounded-full bg-amber-300/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.45),_transparent_55%)]" />
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(transparent_1px,rgba(148,163,184,0.12)_1px)] [background-size:26px_26px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-10 font-body md:px-8 text-left">
        <section className="fade-up rounded-3xl border border-white/10 bg-slate-900/70 px-5 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
                Game Master Lobby
              </p>
              <h1 className="mt-1 text-2xl font-semibold font-display sm:text-3xl">
                Room {roomId}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-rose-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-200 ring-1 ring-rose-400/40">
                Control
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
              <span>Lobby ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.7)]" />
              <span>Assign the dealer before starting</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <section
            className="fade-up rounded-3xl border border-white/10 bg-slate-900/60 px-5 py-6 backdrop-blur"
            style={{ animationDelay: "120ms" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
                  Player Management
                </p>
                <h2 className="mt-1 text-lg font-semibold font-display">
                  Seats and balances
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {players.length} seated
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {players.length > 0 ? (
                players.map((player) => (
                  <GMPlayerCard
                    key={player.id}
                    player={player}
                    onSetDealer={handleSetDealer}
                    onUpdateMoney={handleUpdateMoney}
                    onRemovePlayer={handleRemovePlayer}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-950/40 px-6 py-5 text-center text-sm text-slate-400">
                  Waiting for players to join...
                </div>
              )}
            </div>
          </section>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <section
              className="fade-up rounded-3xl border border-white/10 bg-slate-900/60 px-5 py-6 backdrop-blur"
              style={{ animationDelay: "220ms" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
                    Game Controls
                  </p>
                  <h3 className="mt-1 text-lg font-semibold font-display">
                    Manage the table
                  </h3>
                </div>
                <span className="rounded-full bg-slate-700/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-300">
                  Live
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <h4 className="text-sm font-semibold text-slate-100">
                  Transfer Money
                </h4>
                <div className="mt-3 flex flex-col gap-3 text-xs text-slate-400">
                  <label className="font-semibold">From</label>
                  <select
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <label className="font-semibold">To</label>
                  <select
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <label className="font-semibold">Amount</label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  />
                  <GMButton
                    onClick={handleTransferMoney}
                    className="w-full bg-emerald-500/90 text-white hover:bg-emerald-500"
                  >
                    Transfer
                  </GMButton>
                </div>
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                <button
                  onClick={handleStartGame}
                  className="w-full rounded-2xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-500"
                >
                  Start Game
                </button>
                <button
                  onClick={handleEndRoom}
                  className="mt-3 w-full rounded-2xl border border-rose-400/40 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:border-rose-300/70 hover:text-rose-100"
                >
                  End Room
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default LobbyPageGameMaster;
