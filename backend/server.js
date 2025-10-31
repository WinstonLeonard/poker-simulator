// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors"); // Import the cors package

const convertPlayersObjectToArray = (playersObject) => {
  if (!playersObject) {
    return [];
  }

  // Object.entries() gives: [ ["socketId1", { name: "A" }], ["socketId2", { name: "B" }] ]
  // We map this to the format our frontend state needs.
  return Object.entries(playersObject).map(([id, playerData]) => ({
    id: id,
    ...playerData,
  }));
};

const convertPlayersArrayToObject = (playersArray) => {
  if (!playersArray) {
    return {};
  }

  // Use reduce to build a new object from the array
  return playersArray.reduce((acc, player) => {
    // Destructure to separate the id from the rest of the data
    const { id, ...playerData } = player;

    // Set the key on the new object
    acc[id] = playerData;

    return acc;
  }, {}); // Start with an empty object
};

const app = express();
const server = http.createServer(app);
app.use(
  cors({
    origin: "*", // Allow requests from your React app (frontend)
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Create a Socket.IO server
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow connections from your React app (frontend)
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const rooms = {};
const gameStateCollection = {};

app.get("/api/rooms/:roomId", (req, res) => {
  const { roomId } = req.params;

  if (Object.prototype.hasOwnProperty.call(rooms, roomId)) {
    res.status(200).json({
      status: 200,
      exists: true,
      message: `Room ${roomId} exists.`,
    });
  } else {
    res.status(404).json({
      status: 404,
      exists: false,
      message: `Room ${roomId} not found.`,
    });
  }
});

app.get("/api/roomData/:roomId", (req, res) => {
  const { roomId } = req.params;
  res.status(200).json(rooms[roomId] || {});
});

// Handle connection to the server
io.on("connection", (socket) => {
  console.log("a user connected");

  //create a room
  socket.on("createRoom", (roomId) => {
    console.log(`Room id: ${roomId} created`);
    socket.join(roomId); // Join the room
    rooms[roomId] = { players: {}, gameStart: false };
  });

  // Join a game room
  socket.on("joinRoom", (roomId, playerName) => {
    if (rooms[roomId]) {
      socket.join(roomId); // Join the room
      if (!rooms[roomId].players[socket.id]) {
        console.log(`player ${playerName}, ${socket.id} has joined the room`);
        const dealer = Object.keys(rooms[roomId].players).length === 0;
        rooms[roomId].players[socket.id] = {
          name: playerName,
          money: 1000,
          dealer: dealer,
        };
        io.to(roomId).emit("message", `A new player has joined room ${roomId}`);
        io.to(roomId).emit("playerDataChanged", rooms[roomId]);
      }
    } else {
      socket.emit("error", "Room does not exist.");
    }
  });

  socket.on("playerDataChange", (roomId, playerData) => {
    rooms[roomId].players = playerData;
    io.to(roomId).emit("playerDataChanged", rooms[roomId]);
  });

  socket.on("gameStart", (roomId) => {
    io.to(roomId).emit("gameStart", roomId);
    const a = convertPlayersObjectToArray(rooms[roomId].players);
    const numOfPlayers = a.length;
    const dealerIndex = a.findIndex((player) => player.dealer === true);
    const dealerId = a.find((player) => player.dealer === true).id;
    const smallBlindIndex = (dealerIndex + 1) % numOfPlayers;
    const bigBlindIndex = (dealerIndex + 2) % numOfPlayers;
    const currentPlayerTurnIndex =
      bigBlindIndex + 1 == numOfPlayers ? 0 : bigBlindIndex + 1;
    const smallBlindId = a[smallBlindIndex].id;
    const bigBlindId = a[bigBlindIndex].id;
    const currentPlayerTurnId = a[currentPlayerTurnIndex].id;
    a[smallBlindIndex].money = a[smallBlindIndex].money - 5;
    a[bigBlindIndex].money = a[bigBlindIndex].money - 10;

    const updatedPlayers = a.map((player) => ({
      ...player,
      status: "",
      currentBets:
        player.id === smallBlindId ? 5 : player.id === bigBlindId ? 10 : 0,
      raiseTimes: 0,
    }));

    updatedPlayers[smallBlindIndex].status = "Small Blind";
    updatedPlayers[bigBlindIndex].status = "Big Blind";

    const pot = 15;
    const currentHighestBet = Math.max(
      ...updatedPlayers.map((p) => p.currentBets)
    );

    const gameState = {
      players: updatedPlayers,
      dealerId: dealerId,
      currentPlayerTurnId: currentPlayerTurnId,
      pot: pot,
      currentHighestBet: currentHighestBet,
      totalPlayingPlayers: updatedPlayers.length,
      totalPlayersCalledOrCheck: 0,
      gameStage: "PREFLOP",
    };

    gameStateCollection[roomId] = gameState;
  });

  socket.on("check", (roomId, id) => {
    const gameState = gameStateCollection[roomId];
    gameState.totalPlayersCalledOrCheck += 1;
    // --- Case 1: Everyone has called/checked ---
    if (gameState.totalPlayersCalledOrCheck === gameState.totalPlayingPlayers) {
      const nextStage = (currStage) => {
        if (currStage === "PREFLOP") return "FLOP";
        if (currStage === "FLOP") return "RIVER";
        if (currStage === "RIVER") return "TURN";
        if (currStage === "TURN") return "SHOWDOWN";
        return currStage;
      };
      gameState.gameStage = nextStage(gameState.gameStage);

      // Find the small blind player
      const numOfPlayers = gameState.players.length;
      const dealerIndex = gameState.players.findIndex((p) => p.dealer);
      const smallBlindIndex = (dealerIndex + 1) % numOfPlayers;

      // Find next active (non-folded) player starting from small blind
      let nextIndex = smallBlindIndex;
      for (let i = 0; i < numOfPlayers; i++) {
        const player = gameState.players[nextIndex];
        if (player.status !== "folded" && player.status !== "all-in") {
          gameState.currentPlayerTurnId = player.id;
          break;
        }
        nextIndex = (nextIndex + 1) % numOfPlayers;
      }
      gameState.players = gameState.players.map((player) => ({
        ...player,
        currentBets: 0,
        status:
          player.status === "folded" || player.status === "all-in"
            ? player.status
            : "",
        raiseTimes: 0,
      }));
      gameState.currentHighestBet = 0;
      gameState.totalPlayersCalledOrCheck = 0;

      // --- Case 2: Not everyone has called/checked ---
    } else {
      const numOfPlayers = gameState.players.length;
      const currentIndex = gameState.players.findIndex((p) => p.id === id);

      // Find next active (non-folded) player
      let nextIndex = (currentIndex + 1) % numOfPlayers;
      for (let i = 0; i < numOfPlayers; i++) {
        const player = gameState.players[nextIndex];
        if (player.status !== "folded" && player.status !== "all-in") {
          gameState.currentPlayerTurnId = player.id;
          break;
        }
        nextIndex = (nextIndex + 1) % numOfPlayers;
      }
      gameState.players[currentIndex].status = "check";
    }
    gameStateCollection[roomId] = gameState;

    // Emit updated state
    io.to(roomId).emit("gameStateChange", gameState);
  });

  socket.on("call", (roomId, id, amount) => {
    const gameState = gameStateCollection[roomId];

    // Update player's money, bet, and status
    gameState.players = gameState.players.map((player) =>
      player.id == id
        ? {
            ...player,
            money: player.money - amount,
            currentBets: player.currentBets + amount,
            status: `Call $${gameState.currentHighestBet}`,
          }
        : player
    );

    // Update pot
    gameState.pot += amount;
    gameState.totalPlayersCalledOrCheck += 1;

    // --- Case 1: Everyone has called/checked ---
    if (gameState.totalPlayersCalledOrCheck === gameState.totalPlayingPlayers) {
      const nextStage = (currStage) => {
        if (currStage === "PREFLOP") return "FLOP";
        if (currStage === "FLOP") return "RIVER";
        if (currStage === "RIVER") return "TURN";
        if (currStage === "TURN") return "SHOWDOWN";
        return currStage;
      };
      gameState.gameStage = nextStage(gameState.gameStage);

      // Find the small blind player
      const numOfPlayers = gameState.players.length;
      const dealerIndex = gameState.players.findIndex((p) => p.dealer);
      const smallBlindIndex = (dealerIndex + 1) % numOfPlayers;

      // Find next active (non-folded) player starting from small blind
      let nextIndex = smallBlindIndex;
      for (let i = 0; i < numOfPlayers; i++) {
        const player = gameState.players[nextIndex];
        if (player.status !== "folded") {
          gameState.currentPlayerTurnId = player.id;
          break;
        }
        nextIndex = (nextIndex + 1) % numOfPlayers;
      }

      gameState.players = gameState.players.map((player) => ({
        ...player,
        currentBets: 0,
        status:
          player.status === "folded" || player.status === "all-in"
            ? player.status
            : "",
        raiseTimes: 0,
      }));
      gameState.currentHighestBet = 0;
      gameState.totalPlayersCalledOrCheck = 0;

      // --- Case 2: Not everyone has called/checked ---
    } else {
      const numOfPlayers = gameState.players.length;
      const currentIndex = gameState.players.findIndex((p) => p.id === id);

      // Find next active (non-folded) player
      let nextIndex = (currentIndex + 1) % numOfPlayers;
      for (let i = 0; i < numOfPlayers; i++) {
        const player = gameState.players[nextIndex];
        if (player.status !== "folded") {
          gameState.currentPlayerTurnId = player.id;
          break;
        }
        nextIndex = (nextIndex + 1) % numOfPlayers;
      }
    }
    gameStateCollection[roomId] = gameState;

    // Emit updated state
    io.to(roomId).emit("gameStateChange", gameState);
  });

  socket.on("betOrRaise", (roomId, id, amount, action) => {
    const gameState = gameStateCollection[roomId];
    gameState.totalPlayersCalledOrCheck = 1;
    const previousBet = gameState.players.find(
      (player) => player.id === id
    ).currentBets;
    // Update player's money, bet, and status
    gameState.players = gameState.players.map((player) =>
      player.id == id
        ? {
            ...player,
            money: player.money + previousBet - amount,
            currentBets: amount,
            status: `${action} $${amount}`,
            raiseTimes: action === "bet" ? 0 : 1,
          }
        : player
    );
    gameState.pot = gameState.pot - previousBet + amount;
    gameState.currentHighestBet = amount;

    // Find next active (non-folded) player
    const currentIndex = gameState.players.findIndex((p) => p.id === id);
    const numOfPlayers = gameState.players.length;
    let nextIndex = (currentIndex + 1) % numOfPlayers;
    for (let i = 0; i < numOfPlayers; i++) {
      const player = gameState.players[nextIndex];
      if (player.status !== "folded" && player.status !== "all-in") {
        gameState.currentPlayerTurnId = player.id;
        break;
      }
      nextIndex = (nextIndex + 1) % numOfPlayers;
    }
    gameStateCollection[roomId] = gameState;
    io.to(roomId).emit("gameStateChange", gameState);
  });

  socket.on("fold", (roomId, id) => {
    const gameState = gameStateCollection[roomId];
    gameState.players = gameState.players.map((player) =>
      player.id == id
        ? {
            ...player,
            status: `folded`,
          }
        : player
    );
    gameState.totalPlayingPlayers = gameState.totalPlayingPlayers - 1;
    // --- Case 1: Last remaining player ---

    if (gameState.totalPlayingPlayers == 1) {
      gameState.gameStage = "SHOWDOWN";
    }
    // --- Case 2: Everyone has called/checked ---
    else if (
      gameState.totalPlayersCalledOrCheck === gameState.totalPlayingPlayers
    ) {
      const nextStage = (currStage) => {
        if (currStage === "PREFLOP") return "FLOP";
        if (currStage === "FLOP") return "RIVER";
        if (currStage === "RIVER") return "TURN";
        if (currStage === "TURN") return "SHOWDOWN";
        return currStage;
      };
      gameState.gameStage = nextStage(gameState.gameStage);

      // Find the small blind player
      const numOfPlayers = gameState.players.length;
      const dealerIndex = gameState.players.findIndex((p) => p.dealer);
      const smallBlindIndex = (dealerIndex + 1) % numOfPlayers;

      // Find next active (non-folded) player starting from small blind
      let nextIndex = smallBlindIndex;
      for (let i = 0; i < numOfPlayers; i++) {
        const player = gameState.players[nextIndex];
        if (player.status !== "folded") {
          gameState.currentPlayerTurnId = player.id;
          break;
        }
        nextIndex = (nextIndex + 1) % numOfPlayers;
      }

      gameState.players = gameState.players.map((player) => ({
        ...player,
        currentBets: 0,
        status:
          player.status === "folded" || player.status === "all-in"
            ? player.status
            : "",
        raiseTimes: 0,
      }));
      gameState.currentHighestBet = 0;
      gameState.totalPlayersCalledOrCheck = 0;

      // --- Case 2: Not everyone has called/checked ---
    } else {
      const numOfPlayers = gameState.players.length;
      const currentIndex = gameState.players.findIndex((p) => p.id === id);

      // Find next active (non-folded) player
      let nextIndex = (currentIndex + 1) % numOfPlayers;
      for (let i = 0; i < numOfPlayers; i++) {
        const player = gameState.players[nextIndex];
        if (player.status !== "folded") {
          gameState.currentPlayerTurnId = player.id;
          break;
        }
        nextIndex = (nextIndex + 1) % numOfPlayers;
      }
    }
    gameStateCollection[roomId] = gameState;
    io.to(roomId).emit("gameStateChange", gameState);
  });

  socket.on("all-in", (roomId, id) => {
    const gameState = gameStateCollection[roomId];
    const previousBet = gameState.players.find(
      (player) => player.id === id
    ).currentBets;
    const totalMoney = gameState.players.find(
      (player) => player.id === id
    ).money;
    // Update player's money, bet, and status
    gameState.players = gameState.players.map((player) =>
      player.id == id
        ? {
            ...player,
            currentBets: totalMoney,
            money: 0,
            status: `all-in`,
          }
        : player
    );
    gameState.pot = gameState.pot - previousBet + totalMoney;
    gameState.totalPlayingPlayers = gameState.totalPlayingPlayers - 1;
    if (gameState.totalPlayersCalledOrCheck === gameState.totalPlayingPlayers) {
      const nextStage = (currStage) => {
        if (currStage === "PREFLOP") return "FLOP";
        if (currStage === "FLOP") return "RIVER";
        if (currStage === "RIVER") return "TURN";
        if (currStage === "TURN") return "SHOWDOWN";
        return currStage;
      };
      gameState.gameStage = nextStage(gameState.gameStage);

      // Find the small blind player
      const numOfPlayers = gameState.players.length;
      const dealerIndex = gameState.players.findIndex((p) => p.dealer);
      const smallBlindIndex = (dealerIndex + 1) % numOfPlayers;

      // Find next active (non-folded) player starting from small blind
      let nextIndex = smallBlindIndex;
      for (let i = 0; i < numOfPlayers; i++) {
        const player = gameState.players[nextIndex];
        if (player.status !== "folded") {
          gameState.currentPlayerTurnId = player.id;
          break;
        }
        nextIndex = (nextIndex + 1) % numOfPlayers;
      }

      gameState.players = gameState.players.map((player) => ({
        ...player,
        currentBets: 0,
        status:
          player.status === "folded" || player.status === "all-in"
            ? player.status
            : "",
        raiseTimes: 0,
      }));
      gameState.currentHighestBet = 0;
      gameState.totalPlayersCalledOrCheck = 0;

      // --- Case 2: Not everyone has called/checked ---
    } else {
      const numOfPlayers = gameState.players.length;
      const currentIndex = gameState.players.findIndex((p) => p.id === id);

      // Find next active (non-folded) player
      let nextIndex = (currentIndex + 1) % numOfPlayers;
      for (let i = 0; i < numOfPlayers; i++) {
        const player = gameState.players[nextIndex];
        if (player.status !== "folded") {
          gameState.currentPlayerTurnId = player.id;
          break;
        }
        nextIndex = (nextIndex + 1) % numOfPlayers;
      }
    }
    gameStateCollection[roomId] = gameState;
    io.to(roomId).emit("gameStateChange", gameState);
  });

  socket.on("awardPot", (roomId, winnerId) => {
    const gameState = gameStateCollection[roomId];
    gameState.players = gameState.players.map((player) =>
      player.id == winnerId
        ? {
            ...player,
            money: player.money + gameState.pot,
          }
        : player
    );
    let nextDealerId = "";
    for (let i = 0; i < gameState.players.length; i++) {
      const playerInGameState = gameState.players[i];
      const playerId = playerInGameState.id;
      const playerDataInRooms = rooms[roomId].players[playerId];
      const updatedDataInRooms = {
        ...playerDataInRooms,
        money: playerInGameState.money,
        dealer: false,
      };
      rooms[roomId].players[playerId] = updatedDataInRooms;
      if (playerInGameState.dealer == true) {
        const nextDealerIndex = i + 1 === gameState.players.length ? 0 : i + 1;
        nextDealerId = gameState.players[nextDealerIndex].id;
      }
    }
    const oldDealerData = rooms[roomId].players[nextDealerId];
    const newDealerData = { ...oldDealerData, dealer: true };
    rooms[roomId].players[nextDealerId] = newDealerData;
    console.log("ROOMS DATA", rooms[roomId].players);
    console.log("GAME STATE COLLECTION", gameStateCollection[roomId].players);
    io.to(roomId).emit("backToLobby");
  });

  socket.on("requestGameState", (roomId) => {
    const gameState = gameStateCollection[roomId];
    if (gameState) socket.emit("preflop", gameState);
  });

  // Handle messages from players in the game room
  socket.on("message", (roomId, msg) => {
    console.log(`Message from room ${roomId}:`, msg);
    io.to(roomId).emit("message", msg);
  });

  // Handle game start event
  socket.on("startGame", (roomId) => {
    io.to(roomId).emit("message", "The game has started!");
  });

  // Handle player disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Start the server
server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
