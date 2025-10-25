import React, { useState, useEffect } from "react";
import "../App.css";
import { useParams } from "react-router-dom";
import PlayerCard from "../components/PlayerCard";

const LobbyPagePlayer = () => {
  const { roomId } = useParams();
  const [players, setPlayers] = useState([
    { name: "Alice", money: 1000, dealer: true },
    { name: "Bob", money: 1000, dealer: false },
    { name: "Charlie", money: 800, dealer: false },
    { name: "David", money: 1200, dealer: false },
  ]);

  return (
    <main className="bg-slate-900 min-h-screen flex flex-col items-center p-4 text-white font-sans">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-center animate-pulse">
        Player Lobby
      </h1>

      {/* Room ID Badge */}
      <div className="bg-slate-700 px-6 py-2 rounded-full mb-10 shadow-lg">
        <p className="text-xl md:text-2xl text-cyan-300 font-mono tracking-widest">
          ROOM: <strong>{roomId}</strong>
        </p>
      </div>

      {/* Player List Title */}
      <h2 className="text-3xl font-bold mb-6 text-slate-300">
        Players in Lobby
      </h2>

      {/* Responsive Grid for Player Cards */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {players.map((player) => (
          <PlayerCard key={player.name} player={player} />
        ))}
      </div>
    </main>
  );
};

export default LobbyPagePlayer;
