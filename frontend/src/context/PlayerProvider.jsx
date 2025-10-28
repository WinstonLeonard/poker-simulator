import React, { createContext, useState, useContext, useEffect } from "react";
import { io } from "socket.io-client";

const PlayerContext = createContext(null);

const PlayerProvider = ({ children }) => {
  const [playerName, setPlayerName] = useState("");
  const [gameMaster, setGameMaster] = useState(false);
  const [socket, setSocket] = useState(null);
  const [id, setId] = useState("");
  useEffect(() => {
    const newSocket = io("http://localhost:5000");

    newSocket.on("connect", () => {
      console.log("Socket connected ✅", newSocket.id);
      setId(newSocket.id); // ✅ set after connected
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      console.log("Socket disconnected on provider unmount.");
    };
  }, []);

  const value = {
    playerName,
    setPlayerName,
    gameMaster,
    setGameMaster,
    socket,
    setSocket,
    id,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};

// 3. Create a custom hook for easy access
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

export default PlayerProvider;
