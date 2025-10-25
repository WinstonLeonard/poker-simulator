import React from "react";
import "../App.css";
import { useParams } from "react-router-dom";
const LobbyPageGameMaster = () => {
  const { roomId } = useParams();

  return (
    <main className="bg-slate-900 min-h-screen flex flex-col items-center p-4 text-white font-sans">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-10 text-center animate-pulse">
        Game Master Lobby 🃏
      </h1>
      <p className="text-2xl text-cyan-400">
        Game Room ID: <strong>{roomId}</strong>
      </p>
    </main>
  );
};

export default LobbyPageGameMaster;
