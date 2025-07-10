const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
    socket.to(room).emit("joined", "Your partner has joined!");
  });

  socket.on("draw", ({ room, x, y }) => {
    socket.to(room).emit("draw", { x, y });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on port ${PORT}`);
});