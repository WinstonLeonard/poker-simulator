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
  const [isLoading, setIsLoading] = useState(true); // 🆕 loading state
  const { setPlayerName, playerName, setGameMaster, socket } = usePlayer();

  // 🧠 Call backend once when page loads
  useEffect(() => {
    const fetchServer = async () => {
      try {
        console.log("Contacting server...");
        const response = await contactServer(); // wait for response
        console.log("Server response:", response);
        setIsLoading(false); // ✅ stop loading when done
      } catch (error) {
        console.error("Failed to contact server:", error);
        setModalMessage(
          "Failed to connect to the server. Please try again later."
        );
        setIsModalOpen(true);
        setIsLoading(false);
      }
    };

    fetchServer();
  }, []);

  // ⏳ Show loading screen first
  if (isLoading) {
    return (
      <main className="bg-slate-900 min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4 animate-pulse">
          Connecting to Server...
        </h1>
        <p className="text-slate-400 text-lg">Please wait a moment.</p>
      </main>
    );
  }

  // --- Random PIN generator ---
  const generateRandomNumber = () => {
    const min = 100000;
    const max = 999999;
    return Math.floor(min + Math.random() * (max - min)).toString();
  };

  // --- Join Game handler ---
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
      socket.emit("joinRoom", gamePin, playerName);
    }
  };

  // --- Create Game handler ---
  const handleCreateGame = () => {
    const newGameId = generateRandomNumber();
    console.log(`Creating new game with ID: ${newGameId}`);
    socket.emit("createRoom", newGameId.toString(), playerName);
    setGameMaster(true);
    navigate(`/lobby/${newGameId}`);
  };

  // --- Rejoin Game handler ---
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
      if (!gameMaster) socket.emit("joinRoom", gmGamePin, playerName);
    }
  };

  // --- Main UI ---
  return (
    <main className="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-4 text-white font-sans">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-10 text-center animate-pulse">
        Poker Simulator 🃏
      </h1>

      {/* Player name input */}
      <div className="w-full max-w-sm mb-8">
        <label className="text-lg font-medium text-slate-400 mb-2 block text-center">
          Enter Your Name
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="ENTER YOUR NAME"
          className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-center text-xl placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
        />
      </div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row justify-center gap-8">
        {/* Join Game */}
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl flex-1 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">
            Join a Game 🧩
          </h2>
          <input
            type="text"
            value={gamePin}
            onChange={(e) => setGamePin(e.target.value.toUpperCase())}
            placeholder="ENTER GAME PIN"
            className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-center text-xl font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:border-cyan-500 transition-all mb-4"
          />
          <button
            onClick={handleJoinGame}
            className="w-full bg-cyan-600 hover:bg-cyan-700 font-bold py-3 px-4 rounded-lg text-lg transition-transform duration-200 active:scale-95 shadow-lg"
          >
            Join Game
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center">
          <span className="text-slate-600 font-bold text-2xl">OR</span>
        </div>

        {/* Game Master Section */}
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl flex-1 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-3xl font-bold mb-6 text-center text-violet-400">
            Game Master Admin ✨
          </h2>
          <button
            onClick={handleCreateGame}
            className="w-full bg-violet-600 hover:bg-violet-700 font-bold py-3 px-4 rounded-lg text-lg transition-transform duration-200 active:scale-95 shadow-lg"
          >
            Create New Game
          </button>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-500 font-bold">
              OR
            </span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <input
            type="text"
            value={gmGamePin}
            onChange={(e) => setGmGamePin(e.target.value.toUpperCase())}
            placeholder="ENTER GAME PIN"
            className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-center text-xl font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all mb-4"
          />
          <button
            onClick={handleRejoinGame}
            className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-3 px-4 rounded-lg text-lg transition-transform duration-200 active:scale-95 shadow-lg"
          >
            Rejoin as Game Master
          </button>
        </div>
      </div>

      {/* Error Modal */}
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
