// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors"); // Import the cors package

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
        rooms[roomId].players[socket.id] = {
          name: playerName,
          money: 1000,
          dealer: false,
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
