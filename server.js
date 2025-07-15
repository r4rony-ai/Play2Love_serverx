const app = express(); const server = http.createServer(app);

app.use(cors());

const io = new Server(server, { cors: { origin: ["https://love-testing.vercel.app"], methods: ["GET", "POST"] }, transports: ["websocket"] });

const activeRooms = new Map();

io.on("connection", (socket) => { console.log("🔌 New client connected:", socket.id);

socket.on("createRoom", ({ room, username }) => { socket.join(room); socket.room = room; socket.username = username; activeRooms.set(room, true); console.log(✅ ${username} created room: ${room}); });

socket.on("joinRoom", ({ room, username }) => { if (activeRooms.has(room)) { socket.join(room); socket.room = room; socket.username = username; console.log(👥 ${username} joined room: ${room}); socket.to(room).emit("partnerJoined", { username }); } else { socket.emit("invalidRoom"); } });

socket.on("drawing", (data) => { socket.to(socket.room).emit("drawing", data); });

socket.on("chat", ({ message }) => { socket.to(socket.room).emit("chat", { message, username: socket.username }); });

socket.on("clear", () => { socket.to(socket.room).emit("clear"); });

socket.on("disconnecting", () => { if (socket.room) { const clients = io.sockets.adapter.rooms.get(socket.room); if (!clients || clients.size === 1) { activeRooms.delete(socket.room); } } console.log("❌ Client disconnected:", socket.id); }); });

const PORT = process.env.PORT || 3000; server.listen(PORT, () => { console.log(🚀 Server running on port ${PORT}); });

                                                                  
