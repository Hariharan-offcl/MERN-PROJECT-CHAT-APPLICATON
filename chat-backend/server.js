const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");
const Message = require("./models/Message");

// Load env
dotenv.config();

// Connect DB
connectDB();

const app = express();
const server = http.createServer(app);

// CORS so frontend can talk to backend
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Simple API route to test server
app.get("/", (req, res) => {
  res.send("Basic chat backend with MongoDB Atlas is running ✅");
});

// Route to get previous messages for a room
app.get("/api/messages/:room", async (req, res) => {
  try {
    const { room } = req.params;
    const messages = await Message.find({ room })
      .sort({ createdAt: 1 }); // oldest first
    return res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// When a client connects
io.on("connection", (socket) => {
  console.log("🔌 New socket connected:", socket.id);

  // Frontend will send email when user joins
  socket.on("join_chat", async ({ room, email }) => {
    try {
      socket.join(room);
      socket.data.email = email;
      socket.data.room = room;

      // Ensure user exists in DB
      if (email) {
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({ email });
        }
        console.log(`📌 ${email} joined room: ${room}`);
      }
    } catch (err) {
      console.error("join_chat error:", err.message);
    }
  });

  // When someone sends a message
  socket.on("send_message", async (data) => {
    // data: { room, text, email, time }

    try {
      console.log("📩 New message:", data);

      // Save message in MongoDB
      await Message.create({
        room: data.room,
        senderEmail: data.email,
        text: data.text,
      });

      // Broadcast to everyone in the same room
      io.to(data.room).emit("receive_message", data);
    } catch (err) {
      console.error("send_message error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(
      "❌ Socket disconnected:",
      socket.id,
      socket.data.email || ""
    );
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Basic chat backend running on port ${PORT}`);
});
