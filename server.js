const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Allow CORS for your frontend domain
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: ["https://love-testing.vercel.app"], // ✅ your deployed frontend
    methods: ["GET", "POST"]
  },
  transports: ["websocket"], // Ensures fast connection
});

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("joinRoom", ({ room, username }) => {
    socket.join(room);
    socket.room = room;
    socket.username = username;
    console.log(`👥 ${username} joined room: ${room}`);

    // Notify other client
    socket.to(room).emit("partnerJoined", { username });
  });

  // Drawing sync
  socket.on("drawing", (data) => {
    socket.to(socket.room).emit("drawing", data);
  });

  // Chat sync
  socket.on("chat", ({ message }) => {
    socket.to(socket.room).emit("chat", {
      message,
      username: socket.username
    });
  });

  // Canvas clear
  socket.on("clear", () => {
    socket.to(socket.room).emit("clear");
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
