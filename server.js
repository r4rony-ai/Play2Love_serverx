const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Use your Vercel link here for production
    methods: ["GET", "POST"]
  }
});

const roomUsers = {}; // Track users by room

io.on("connection", (socket) => {
  console.log("🔌 A user connected");

  socket.on("join", ({ room, username }) => {
    socket.join(room);
    socket.room = room;
    socket.username = username;

    if (!roomUsers[room]) roomUsers[room] = [];

    if (!roomUsers[room].includes(username)) {
      roomUsers[room].push(username);
    }

    // Notify others in the room
    io.to(room).emit("joined", roomUsers[room]);
    io.to(room).emit("user-list", roomUsers[room]);
    console.log(`✅ ${username} joined room ${room}`);
  });

  socket.on("draw", (data) => {
    socket.to(data.room).emit("draw", data);
  });

  socket.on("start-game", ({ room }) => {
    socket.to(room).emit("start-game");
  });

  socket.on("disconnect", () => {
    const room = socket.room;
    const username = socket.username;

    if (room && roomUsers[room]) {
      roomUsers[room] = roomUsers[room].filter(name => name !== username);
      io.to(room).emit("user-list", roomUsers[room]);
      console.log(`❌ ${username} left room ${room}`);
    }
  });
});

app.get("/", (req, res) => {
  res.send("🟢 Play2Love Socket.IO Server Running");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
