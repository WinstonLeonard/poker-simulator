// src/App.jsx

import { useEffect } from "react";
import HomePage from "./pages/HomePage"; // Adjust the path if you saved it elsewhere
import PlayerProvider from "./context/PlayerProvider";
import LobbyPage from "./pages/LobbyPage";
import GameRoomPage from "./pages/GameRoomPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const message =
        "Refreshing will lose all game data. Are you sure you want to refresh?";
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    // All routes inside PlayerProvider can access the player's name
    <PlayerProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lobby/:roomId" element={<LobbyPage />} />
          <Route path="/gameroom/:roomId" element={<GameRoomPage />} />
        </Routes>
      </Router>
    </PlayerProvider>
  );
}

export default App;
