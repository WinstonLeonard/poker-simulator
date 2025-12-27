import React, { useState, useEffect } from "react";
import "../App.css";
import { useParams, useNavigate } from "react-router-dom";
import PlayerCard from "../components/PlayerCard";
import { getRoomData } from "../api/api";
import { usePlayer } from "../context/PlayerProvider";
import { convertPlayersObjectToArray } from "../utils/utils";

const LobbyPagePlayer = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const { socket } = usePlayer();

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const data = await getRoomData(roomId);
        const playersArray = convertPlayersObjectToArray(data.players);
        setPlayers(playersArray);
      } catch (error) {}
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

  return (
    <main className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[120px]" />
        <div className="absolute bottom-[-140px] right-[-120px] h-[360px] w-[360px] rounded-full bg-amber-300/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.45),_transparent_55%)]" />
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(transparent_1px,rgba(148,163,184,0.12)_1px)] [background-size:26px_26px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 font-body md:px-8 text-left">
        <section className="fade-up rounded-3xl border border-white/10 bg-slate-900/70 px-5 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
                Player Lobby
              </p>
              <h1 className="mt-1 text-2xl font-semibold font-display sm:text-3xl">
                Room {roomId}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-200 ring-1 ring-emerald-400/40">
                Waiting
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
              <span>Lobby open</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.7)]" />
              <span>Share the room PIN to invite players</span>
            </div>
          </div>
        </section>

        <section
          className="fade-up rounded-3xl border border-white/10 bg-slate-900/60 px-5 py-6 backdrop-blur"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
                Players
              </p>
              <h2 className="mt-1 text-lg font-semibold font-display">
                Seated at the table
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {players.length} total
            </span>
          </div>

          <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
            {players.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-950/40 px-6 py-5 text-center text-sm text-slate-400">
                Waiting for players to join the lobby.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default LobbyPagePlayer;
