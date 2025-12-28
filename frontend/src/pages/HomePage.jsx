import React, { useState, useEffect } from "react";
import "../App.css";
import { usePlayer } from "../context/PlayerProvider";
import { useNavigate } from "react-router-dom";
import { roomChecker, contactServer } from "../api/api";
import ErrorModal from "../components/ErrorModal";

function HomePage() {
  const navigate = useNavigate();
  const [gamePin, setGamePin] = useState("");
  const [gmGamePin, setGmGamePin] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { setPlayerName, playerName, setGameMaster, socket, id } = usePlayer();

  useEffect(() => {
    const fetchServer = async () => {
      try {
        await contactServer();
      } finally {
        setIsLoading(false);
      }
    };

    fetchServer();
  }, []);

  if (isLoading) {
    return (
      <main className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
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
            <h1 className="mt-2 text-2xl font-semibold font-display">
              Reaching the poker server...
            </h1>
            <p className="mt-3 text-sm text-slate-300">
              Warming up the table and waiting for a response.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const generateRandomNumber = () => {
    const min = 100000;
    const max = 999999;
    return Math.floor(min + Math.random() * (max - min)).toString();
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setModalMessage("Please enter your name.");
      setIsModalOpen(true);
      return;
    }
    if (!gamePin.trim()) {
      setModalMessage("Please enter a game PIN.");
      setIsModalOpen(true);
      return;
    }

    const roomExists = await roomChecker(gamePin);
    if (roomExists.status === 404) {
      setModalMessage(
        "Room does not exist. Please check the Game PIN and try again."
      );
      setIsModalOpen(true);
    } else {
      setGameMaster(false);
      navigate(`/lobby/${gamePin}`);
      socket.emit("joinRoom", gamePin, playerName, id);
    }
  };

  const handleCreateGame = () => {
    const newGameId = generateRandomNumber();
    socket.emit("createRoom", newGameId.toString(), playerName);
    setGameMaster(true);
    navigate(`/lobby/${newGameId}`);
  };

  const handleRejoinGame = async (gameMaster = false) => {
    if (!gameMaster && !playerName.trim()) {
      setModalMessage("Please enter your name.");
      setIsModalOpen(true);
      return;
    }
    if (!gmGamePin.trim()) {
      setModalMessage("Please enter a game PIN to rejoin.");
      setIsModalOpen(true);
      return;
    }

    const roomExists = await roomChecker(gmGamePin);
    if (roomExists.status === 404) {
      setModalMessage(
        "Room does not exist. Please check the Game PIN and try again."
      );
      setIsModalOpen(true);
    } else {
      setGameMaster(true);
      navigate(`/lobby/${gmGamePin}`);
      if (!gameMaster) socket.emit("joinRoom", gmGamePin, playerName, id);
    }
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[120px]" />
        <div className="absolute bottom-[-140px] right-[-120px] h-[360px] w-[360px] rounded-full bg-amber-300/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.45),_transparent_55%)]" />
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(transparent_1px,rgba(148,163,184,0.12)_1px)] [background-size:26px_26px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 font-body md:px-8">
        <div className="fade-up text-center">
          <h1 className="text-3xl font-semibold font-display sm:text-4xl">
            Poker Chips Simulator 🃏
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Set your seat, invite friends, and jump straight into the action.
          </p>
        </div>

        <section className="fade-up rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-6 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
                Player Profile
              </p>
              <h2 className="mt-1 text-lg font-semibold font-display">
                Enter your display name
              </h2>
            </div>
            <span className="text-xs text-slate-400">Visible to the table</span>
          </div>
          <div className="mt-4">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="ENTER YOUR NAME"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-center text-lg font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            />
          </div>
        </section>

        <section
          className="fade-up grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
          style={{ animationDelay: "220ms" }}
        >
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
                  Player Seat
                </p>
                <h3 className="mt-1 text-xl font-semibold font-display">
                  Join a game
                </h3>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-200 ring-1 ring-emerald-400/40">
                Ready
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Enter the game PIN from your host to sit at the table.
            </p>
            <input
              type="text"
              value={gamePin}
              onChange={(e) => setGamePin(e.target.value.toUpperCase())}
              placeholder="ENTER GAME PIN"
              className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-center text-lg font-semibold tracking-[0.3em] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            />
            <button
              onClick={handleJoinGame}
              className="mt-4 w-full rounded-2xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-500"
            >
              Join Game
            </button>
          </div>

          <div className="hidden h-full w-px bg-gradient-to-b from-transparent via-slate-700/70 to-transparent lg:block" />

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
                  Game Master
                </p>
                <h3 className="mt-1 text-xl font-semibold font-display">
                  Create or rejoin
                </h3>
              </div>
              <span className="rounded-full bg-rose-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-200 ring-1 ring-rose-400/40">
                Control
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Start a new table or jump back into an existing room.
            </p>
            <button
              onClick={handleCreateGame}
              className="mt-4 w-full rounded-2xl bg-rose-500/90 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-rose-500"
            >
              Create New Game
            </button>

            <div className="my-5 flex items-center">
              <div className="flex-grow border-t border-slate-700/80" />
              <span className="mx-3 text-[11px] uppercase tracking-[0.4em] text-slate-500">
                or
              </span>
              <div className="flex-grow border-t border-slate-700/80" />
            </div>

            <input
              type="text"
              value={gmGamePin}
              onChange={(e) => setGmGamePin(e.target.value.toUpperCase())}
              placeholder="ENTER GAME PIN"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-center text-lg font-semibold tracking-[0.3em] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400/60"
            />
            <button
              onClick={handleRejoinGame}
              className="mt-4 w-full rounded-2xl border border-rose-400/40 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-rose-200 shadow transition hover:border-rose-300/70 hover:text-rose-100"
            >
              Rejoin as Game Master
            </button>
          </div>
        </section>
      </div>

      <ErrorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Error"
        message={modalMessage}
      />
    </main>
  );
}

export default HomePage;
