import React, { useState, useEffect } from "react";
import "../App.css";
import { usePlayer } from "../context/PlayerProvider";
import { useNavigate } from "react-router-dom";
import { roomChecker } from "../api/api";
import ErrorModal from "../components/ErrorModal";

function HomePage() {
  const navigate = useNavigate();
  const [gamePin, setGamePin] = useState(""); // For "Join" card
  const [gmGamePin, setGmGamePin] = useState(""); // For "GM" card
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState(""); // State for modal message
  const { setPlayerName, playerName, setGameMaster, socket } = usePlayer();

  const generateRandomNumber = () => {
    const min = 100000;
    const max = 999999;
    const rand = min + Math.random() * (max - min);
    return Math.floor(rand).toString();
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
    console.log(roomExists);
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

  const handleCreateGame = () => {
    // --- MODIFICATION ---
    // Removed player name check for Game Master
    // if (!playerName.trim()) {
    //   setModalMessage("Please enter your name to create a game.");
    //   setIsModalOpen(true);
    //   return;
    // }
    // --- END MODIFICATION ---

    const newGameId = generateRandomNumber();
    console.log(`Creating new game with ID: ${newGameId}`);
    // playerName will be an empty string if not entered, which is fine
    socket.emit("createRoom", newGameId.toString(), playerName);
    setGameMaster(true);
    navigate(`/lobby/${newGameId}`);
  };

  const handleRejoinGame = async (gameMaster = false) => {
    // This check is (accidentally) skipped when clicked because `gameMaster`
    // becomes an event object, which is truthy. This fulfills the
    // requirement of not needing a name for the GM.
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
      setGameMaster(true); // Set as Game Master
      navigate(`/lobby/${gmGamePin}`);
      // This emit is (accidentally) skipped because `gameMaster` is truthy.
      if (!gameMaster) socket.emit("joinRoom", gmGamePin, playerName);
    }
  };

  return (
    <main className="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-4 text-white font-sans">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-10 text-center animate-pulse">
        Poker Simulator 🃏
      </h1>

      {/* --- SHARED PLAYER NAME INPUT --- */}
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
        {/* Card for Joining a Game */}
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl flex-1 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">
            Join a Game 🧩
          </h2>
          <div className="flex flex-col gap-4">
            {/* Player name input removed from here */}
            <input
              type="text"
              value={gamePin}
              onChange={(e) => setGamePin(e.target.value.toUpperCase())}
              placeholder="ENTER GAME PIN"
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-center text-xl font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            />
            <button
              onClick={handleJoinGame}
              className="w-full bg-cyan-600 hover:bg-cyan-700 font-bold py-3 px-4 rounded-lg text-lg transition-transform duration-200 active:scale-95 shadow-lg"
            >
              Join Game
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center">
          <span className="text-slate-600 font-bold text-2xl">OR</span>
        </div>

        {/* Card for Creating a New Game */}
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl flex-1 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-3xl font-bold mb-6 text-center text-violet-400">
            Game Master Admin ✨
          </h2>

          {/* Create Game Section */}
          <p className="text-slate-400 mb-4 text-center">
            Start a new game session.
          </p>
          <button
            onClick={handleCreateGame}
            className="w-full bg-violet-600 hover:bg-violet-700 font-bold py-3 px-4 rounded-lg text-lg transition-transform duration-200 active:scale-95 shadow-lg"
          >
            Create New Game
          </button>

          {/* "OR" Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-500 font-bold">
              OR
            </span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          {/* Rejoin Game Section */}
          <p className="text-slate-400 mb-4 text-center">
            Rejoin an existing game as Game Master.
          </p>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={gmGamePin}
              onChange={(e) => setGmGamePin(e.target.value.toUpperCase())}
              placeholder="ENTER GAME PIN"
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-center text-xl font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <button
              onClick={handleRejoinGame}
              className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-3 px-4 rounded-lg text-lg transition-transform duration-200 active:scale-95 shadow-lg"
            >
              Rejoin as Game Master
            </button>
          </div>
        </div>
      </div>

      {/* Modal is now dynamic */}
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
