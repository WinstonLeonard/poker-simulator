import React, { useEffect } from "react";
import { usePlayer } from "../context/PlayerProvider";
import LobbyPageGameMaster from "./LobbyPageGameMaster";
import LobbyPagePlayer from "./LobbyPagePlayer";

const LobbyPage = () => {
  const { gameMaster } = usePlayer();

  if (gameMaster) {
    return <LobbyPageGameMaster />;
  } else {
    return <LobbyPagePlayer />;
  }
};

export default LobbyPage;
