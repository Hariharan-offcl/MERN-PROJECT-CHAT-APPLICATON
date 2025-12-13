
import { useState, useEffect } from "react";
import MessageBubble from "./MessageBubble.jsx";
import MessageInput from "./MessageInput.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import socket from "../socket";

function ChatWindow({ selectedChat, room, email }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);


  useEffect(() => {
    if (!room || !email) return;

    fetch(`http://localhost:5000/api/messages/${room}`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((m) => ({
          room: m.room,
          text: m.text,
          email: m.senderEmail,
          time: new Date(m.createdAt).toLocaleTimeString(),
        }));
        setMessages(formatted);
      })
      .catch((err) => {
        console.error("Error loading messages:", err);
      });
  }, [room, email]);


  useEffect(() => {
    if (!room || !email) return;

    const handleReceive = (data) => {
      if (data.room === room) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [room, email]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    const msg = {
      room,
      text,
      email,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, msg]);


    socket.emit("send_message", msg);

    setIsTyping(false);
  };

  if (!selectedChat) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center text-muted">
        Select a chat from the left to start messaging.
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column bg-light"
      style={{ height: "calc(100vh - 56px)" }}
    >
      {/* Header */}
      <div className="d-flex align-items-center border-bottom bg-white px-3 py-2">
        <div
          className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-2"
          style={{ width: "36px", height: "36px" }}
        >
          {selectedChat.name.charAt(0)}
        </div>
        <div>
          <div className="small fw-semibold">{selectedChat.name}</div>
          <div className="small text-success">online</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto px-3 py-2">
        {messages.map((m, idx) => (
          <MessageBubble
            key={idx}
            text={`${m.text} (${m.email})`}
            fromMe={m.email === email}
          />
        ))}
        {isTyping && <TypingIndicator name="Someone" />}
      </div>

      {/* Input */}
      <div className="border-top bg-white px-3 py-2">
        <MessageInput onSend={handleSend} onTypingChange={setIsTyping} />
      </div>
    </div>
  );
}

export default ChatWindow;
