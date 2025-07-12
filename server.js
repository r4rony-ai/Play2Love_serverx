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

const rooms = {};

io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("join", (room) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = [];
    rooms[room].push(socket.id);

    const partnerSocketId = rooms[room].find((id) => id !== socket.id);
    if (partnerSocketId) {
      io.to(partnerSocketId).emit("partner-joined", `Partner`);
      socket.emit("partner-joined", `Partner`);
    }

    console.log(`📥 Socket ${socket.id} joined room ${room}`);
  });

  socket.on("draw", (data) => {
    socket.to(data.room).emit("draw", data);
  });

  socket.on("chat", ({ room, msg, username }) => {
    socket.to(room).emit("chat", { username, msg });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    for (const room in rooms) {
      rooms[room] = rooms[room].filter(id => id !== socket.id);
      if (rooms[room].length === 0) {
        delete rooms[room];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
