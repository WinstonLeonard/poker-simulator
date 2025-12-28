import React, { createContext, useState, useContext, useEffect } from "react";
import { io } from "socket.io-client";
import { BASE_URL } from "../api/api";

const USER_ID_STORAGE_KEY = "poker.userId";

const createUserId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const getOrCreateUserId = () => {
  if (typeof window === "undefined") {
    return createUserId();
  }
  try {
    const stored = window.sessionStorage.getItem(USER_ID_STORAGE_KEY);
    if (stored) {
      return stored;
    }
    const nextId = createUserId();
    window.sessionStorage.setItem(USER_ID_STORAGE_KEY, nextId);
    return nextId;
  } catch (error) {
    return createUserId();
  }
};

const PlayerContext = createContext(null);

const PlayerProvider = ({ children }) => {
  const [playerName, setPlayerName] = useState("");
  const [gameMaster, setGameMaster] = useState(false);
  const [socket, setSocket] = useState(null);
  const [id] = useState(() => getOrCreateUserId());

  useEffect(() => {
    if (!id) return;
    try {
      window.sessionStorage.setItem(USER_ID_STORAGE_KEY, id);
    } catch (error) {
      // Ignore storage failures; id will still live in memory.
    }
  }, [id]);
  useEffect(() => {
    const newSocket = io(BASE_URL, {
      transports: ["websocket"], // force pure WebSocket (no polling)
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000, // 1s initial delay
      reconnectionDelayMax: 5000, // up to 5s
    });

    newSocket.on("connect", () => {
      console.log("Socket connected.", newSocket.id);
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
