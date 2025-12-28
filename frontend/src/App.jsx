// src/App.jsx

import HomePage from "./pages/HomePage"; // Adjust the path if you saved it elsewhere
import PlayerProvider from "./context/PlayerProvider";
import LobbyPage from "./pages/LobbyPage";
import GameRoomPage from "./pages/GameRoomPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
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
