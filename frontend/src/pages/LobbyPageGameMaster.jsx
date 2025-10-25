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

  // State for the transfer form
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState(0);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const data = await getRoomData(roomId);
        // Transform data.players from object to array
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

    // 1. Define the handler function for your event
    const handlePlayerDataChanged = (roomData) => {
      if (roomData && roomData.players) {
        const playersArray = Object.entries(roomData.players).map(
          ([id, data]) => ({
            id,
            ...data,
          })
        );
        setPlayers(playersArray);
      }
    };

    // 2. Register the listener
    socket.on("playerDataChanged", handlePlayerDataChanged);

    // 3. Return a cleanup function
    return () => {
      // This removes the listener when the component unmounts
      socket.off("playerDataChanged", handlePlayerDataChanged);
    };
  }, [socket]);

  // Effect to set default values for the transfer form
  useEffect(() => {
    if (players.length > 1) {
      setTransferFrom(players[0].id);
      setTransferTo(players[1].id);
    }
  }, [players]);

  // --- Handler Functions ---

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
    // In a real app: socket.emit('removePlayer', { roomId, playerId });
  };

  const handleUpdateMoney = (playerId, amount) => {
    const numAmount = parseInt(amount);
    if (isNaN(numAmount)) return;
    const updatedPlayers = players.map((p) => {
      if (p.id === playerId) {
        const newMoney = p.money + numAmount;
        return { ...p, money: newMoney < 0 ? 0 : newMoney }; // Prevent negative money
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
      // Use a custom modal or just log, avoid alert()
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
    console.log("Starting the game!");
    // In a real app: socket.emit('startGame', roomId);
    // navigate(`/game/${roomId}`);
  };

  // --- NEW: Handle End Room ---
  const handleEndRoom = () => {
    // In a real app, you would show a confirmation modal here instead of alert()
    console.log("Attempting to end room...");
    // For demo, we'll just log and navigate
  };

  // --- Render ---

  return (
    <main className="bg-slate-900 min-h-screen flex flex-col items-center p-4 md:p-8 text-white font-sans">
      {/* Header */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center animate-pulse">
        Game Master Lobby 🃏
      </h1>
      <div className="bg-slate-700 px-6 py-2 rounded-full mb-10 shadow-lg">
        <p className="text-lg md:text-xl text-cyan-300 font-mono tracking-widest">
          ROOM: <strong>{roomId}</strong>
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1 & 2: Player Management */}
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold mb-6 text-slate-300">
            Player Management
          </h2>
          <div className="flex flex-col gap-6">
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
              <p className="text-slate-400 text-center text-lg">
                Waiting for players to join...
              </p>
            )}
          </div>
        </div>

        {/* Column 3: Game Controls */}
        <div className="lg:col-span-1">
          <h2 className="text-3xl font-bold mb-6 text-slate-300">
            Game Controls
          </h2>
          <div className="bg-slate-800 rounded-xl shadow-lg p-6 sticky top-8">
            {/* Transfer Money Form */}
            <h3 className="text-xl font-semibold text-white mb-4">
              Transfer Money
            </h3>
            <div className="flex flex-col gap-3 mb-6">
              <label className="text-sm font-medium text-slate-400">
                From:
              </label>
              <select
                value={transferFrom}
                onChange={(e) => setTransferFrom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <label className="text-sm font-medium text-slate-400">To:</label>
              <select
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <label className="text-sm font-medium text-slate-400">
                Amount:
              </label>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-700 rounded-md text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <GMButton
                onClick={handleTransferMoney}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
              >
                Transfer
              </GMButton>
            </div>

            {/* Start/End Game Buttons */}
            <div className="border-t border-slate-700 pt-6">
              <button
                onClick={handleStartGame}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xl font-bold text-white shadow-lg transition-all transform hover:scale-105"
              >
                Start Game
              </button>

              {/* --- NEW BUTTON --- */}
              <button
                onClick={handleEndRoom}
                className="w-full mt-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-lg font-bold text-white shadow-lg transition-all"
              >
                End Room
              </button>
              {/* --- END NEW BUTTON --- */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LobbyPageGameMaster;
