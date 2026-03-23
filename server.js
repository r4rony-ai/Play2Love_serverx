const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

let rooms = {};

io.on("connection", (socket) => {

  socket.on("joinRoom", ({ room, username }) => {
    socket.join(room);

    if (!rooms[room]) rooms[room] = [];
    rooms[room].push({ id: socket.id, username });

    io.to(room).emit("roomUsers", rooms[room]);

    if (rooms[room].length === 2) {
      io.to(room).emit("start");
    }
  });

  socket.on("chat", ({ room, message }) => {
    socket.to(room).emit("chat", message);
  });

  socket.on("disconnect", () => {
    for (let room in rooms) {
      rooms[room] = rooms[room].filter(u => u.id !== socket.id);
      io.to(room).emit("roomUsers", rooms[room]);
    }
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running"));
