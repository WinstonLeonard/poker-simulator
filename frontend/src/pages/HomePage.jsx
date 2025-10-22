// src/pages/HomePage.jsx

import React, { useState } from "react";
import "../App.css";

function HomePage() {
  const [gamePin, setGamePin] = useState("");

  const handleJoinGame = () => {
    // Basic validation
    if (!gamePin.trim()) {
      alert("Please enter a game PIN.");
      return;
    }
    // TODO: Add logic to join the game with the pin
    // Example: navigate(`/game/${gamePin}`);
    alert(`Joining game with PIN: ${gamePin}`);
    console.log(`Attempting to join game with PIN: ${gamePin}`);
  };

  const handleCreateGame = () => {
    // TODO: Add logic to create a new game and get a new game ID
    // Example: const newGame = await createGameAPI(); navigate(`/game/${newGame.id}`);
    alert("Starting a new game!");
    console.log("Attempting to create a new game.");
  };

  return (
    <main className="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-4 text-white font-sans">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-10 text-center animate-pulse">
        Poker Simulator 🃏
      </h1>

      <div className="w-full max-w-4xl flex flex-col md:flex-row justify-center gap-8">
        {/* Card for Joining a Game */}
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl flex-1 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">
            Join a Game 🧩
          </h2>
          <div className="flex flex-col gap-4">
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
          <span className="text-slate-600 font-bold text-2xl"></span>
        </div>

        {/* Card for Creating a New Game */}
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl flex-1 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-3xl font-bold mb-6 text-center text-violet-400">
            Start a New Game ✨
          </h2>
          <p className="text-slate-400 mb-6 text-center">
            No PIN? No problem! Start a new game and invite your friends.
          </p>
          <button
            onClick={handleCreateGame}
            className="w-full bg-violet-600 hover:bg-violet-700 font-bold py-3 px-4 rounded-lg text-lg transition-transform duration-200 active:scale-95 shadow-lg"
          >
            Create New Game
          </button>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
