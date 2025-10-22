// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.static("client/build"));

// Handle connection to the server
io.on("connection", (socket) => {
  console.log("a user connected");

  // Join a game room
  socket.on("joinRoom", (roomId) => {
    console.log(`User joining room: ${roomId}`);
    socket.join(roomId); // Join the room
    io.to(roomId).emit("message", `A new player has joined room ${roomId}`);
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
