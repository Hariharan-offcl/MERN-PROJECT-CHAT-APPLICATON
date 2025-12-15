// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Chat = require("./models/Chat");
const Message = require("./models/Message");

// Load env variables
dotenv.config();

// Connect DB
connectDB();

const app = express();
const server = http.createServer(app);

// CORS setup
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Helper: generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Middleware: protect routes (HTTP)
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(401).json({ message: "Token invalid" });
  }
};

// -------------------- BASIC ROUTES --------------------

app.get("/", (req, res) => {
  res.send("Chat backend with auth & private chats is running ");
});

// -------------------- AUTH ROUTES --------------------

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      // no token needed for register-only, but we keep it if you want later
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});
// -------------------- CONTACTS ROUTE (Stage 1) --------------------

// Get "my contacts" = people I have chats with
app.get("/api/my-contacts", protect, async (req, res) => {
  try {
    const myChats = await Chat.find({
      participants: req.user._id,
    }).populate("participants", "name email");

    const contactsMap = new Map();

    myChats.forEach((chat) => {
      chat.participants.forEach((p) => {
        if (p._id.toString() !== req.user._id.toString()) {
          if (!contactsMap.has(p._id.toString())) {
            contactsMap.set(p._id.toString(), p);
          }
        }
      });
    });

    const contacts = Array.from(contactsMap.values());
    res.json(contacts);
  } catch (err) {
    console.error("Get contacts error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get own profile
app.get("/api/auth/me", protect, async (req, res) => {
  res.json(req.user);
});

// -------------------- USER ROUTES --------------------

// Get all other users (for chat list)
app.get("/api/users", protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password"
    );
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- CHAT & MESSAGE ROUTES --------------------

// Get all chats for logged-in user
app.get("/api/chats", protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [req.user._id] },
    })
      .populate("participants", "name email")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error("Get chats error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Create or get 1-to-1 chat with another user
app.post("/api/chats/one-to-one", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId is required" });
    }

    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [userId, otherUserId] },
    });

    if (!chat) {
      chat = await Chat.create({
        isGroup: false,
        participants: [userId, otherUserId],
      });
    }

    chat = await chat.populate("participants", "name email");
    res.json(chat);
  } catch (err) {
    console.error("Create/get chat error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get messages in a chat
app.get("/api/messages/:chatId", protect, async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .populate("senderId", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- SOCKET.IO SETUP --------------------

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Socket auth middleware (for JWT)
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.log("Socket connected without token");
    return next(); // or next(new Error("Unauthorized"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log(" New socket connected:", socket.id, "userId:", socket.userId);

  // Join a specific chat room (by chatId)
  socket.on("join_chat", (chatId) => {
    if (!chatId) return;
    socket.join(chatId);
    console.log(` Socket ${socket.id} joined chat ${chatId}`);
  });

  // Send message in a chat
  socket.on("send_message", async (data) => {
    try {
      // data: { chatId, text }
      if (!socket.userId) {
        console.log("send_message blocked: no userId on socket");
        return;
      }

      const newMessage = await Message.create({
        chatId: data.chatId,
        senderId: socket.userId,
        text: data.text,
      });

      const populated = await newMessage.populate("senderId", "name email");

      //  Only send to OTHER user(s), not sender (no duplicate)
      socket.to(data.chatId).emit("receive_message", populated);

      console.log("📤 Message sent to chat:", data.chatId);
    } catch (err) {
      console.error("send_message error:", err.message);
    }
  });

  // Typing indicator: user started typing
  socket.on("typing", ({ chatId }) => {
    if (!socket.userId || !chatId) return;

    socket.to(chatId).emit("typing", {
      chatId,
      senderId: socket.userId,
    });
  });

  // Typing indicator: user stopped typing
  socket.on("stop_typing", ({ chatId }) => {
    if (!socket.userId || !chatId) return;

    socket.to(chatId).emit("stop_typing", {
      chatId,
      senderId: socket.userId,
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// -------------------- START SERVER --------------------

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Chat backend with auth running on port ${PORT}`);
});