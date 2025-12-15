// src/socket.js
import { io } from "socket.io-client";

// Use environment variable instead of localhost
export const API_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

let socket = null;

// Initialize socket AFTER login, when token is available
export const initSocket = (token) => {
  if (socket) return socket; // reuse existing socket

  socket = io(API_URL, {
    auth: { token }, // send JWT token to backend
    transports: ["websocket"], // ensure stable connection
    withCredentials: true      // allow cookies/auth headers if needed
  });

  socket.on("connect", () => {
    console.log("Connected to socket server:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connect error:", err.message);
  });

  return socket;
};

// Just get the existing socket (if already created)
export const getSocket = () => socket;
