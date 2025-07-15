const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: ["https://love-testing.vercel.app"],
    methods: ["GET", "POST"],
  },
  transports: ["websocket"]
});

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("joinRoom", ({ room, username }) => {
    socket.join(room);
    socket.room = room;
    socket.username = username;
    console.log(`👥 ${username} joined room: ${room}`);
    socket.to(room).emit("partnerJoined", { username });
  });

  socket.on("drawing", (data) => {
    socket.to(socket.room).emit("drawing", data);
  });

  socket.on("chat", ({ message }) => {
    socket.to(socket.room).emit("chat", { message, username: socket.username });
  });

  socket.on("clear", () => {
    socket.to(socket.room).emit("clear");
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
