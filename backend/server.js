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
    console.log(rooms);
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
    console.log("updated room data", rooms[roomId]);
    io.to(roomId).emit("playerDataChanged", rooms[roomId]);
  });

  socket.on("gameStart", (roomId) => {
    io.to(roomId).emit("gameStart", roomId);
    const a = convertPlayersObjectToArray(rooms[roomId].players);
    const numOfPlayers = a.length;
    const dealerIndex = a.findIndex((player) => player.dealer === true);
    const dealerId = a.find((player) => player.dealer === true).id;
    const smallBlindIndex =
      dealerIndex + 1 == numOfPlayers ? 0 : dealerIndex + 1;
    const bigBlindIndex = dealerIndex + 2 >= numOfPlayers ? 1 : dealerIndex + 2;
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
    console.log("GAME STATE", gameState);
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
    console.log(`Game started in room ${roomId}`);
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
