
import { useState, useEffect } from "react";
import MessageBubble from "./MessageBubble.jsx";
import MessageInput from "./MessageInput.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import { API_URL } from "../socket";

function ChatWindow({ currentUser, selectedChat, socket }) {
  const [messages, setMessages] = useState([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  const token = localStorage.getItem("token");
  const chatId = selectedChat?.chatId;
  const otherUser = selectedChat?.otherUser;

  // Load messages
  useEffect(() => {
    if (!chatId || !token) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/messages/${chatId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          console.error("Error loading messages:", data);
          return;
        }

        const formatted = data.map((m) => ({
          _id: m._id,
          chatId: m.chatId,
          text: m.text,
          sender: m.senderId,
          time: new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setMessages(formatted);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [chatId, token]);

  // Receive messages
  useEffect(() => {
    if (!chatId || !socket) return;

    const handleReceive = (msg) => {
      if (msg.chatId === chatId) {
        const formatted = {
          _id: msg._id,
          chatId: msg.chatId,
          text: msg.text,
          sender: msg.senderId,
          time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, formatted]);
      }
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [chatId, socket]);

  // Typing events
  useEffect(() => {
    if (!chatId || !socket) return;

    const handleTyping = (data) => {
      if (data.chatId === chatId && data.senderId !== currentUser._id) {
        setIsOtherTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (data.chatId === chatId && data.senderId !== currentUser._id) {
        setIsOtherTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [chatId, socket, currentUser._id]);

  const handleTypingChange = (isTyping) => {
    if (!chatId || !socket) return;

    if (isTyping) {
      socket.emit("typing", { chatId });
    } else {
      socket.emit("stop_typing", { chatId });
    }
  };

  const handleSend = (text) => {
    if (!text.trim() || !chatId || !socket) return;

    socket.emit("send_message", {
      chatId,
      text,
    });

    const tempMsg = {
      _id: `temp-${Date.now()}`,
      chatId,
      text,
      sender: {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
      },
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, tempMsg]);

    handleTypingChange(false);
  };

  if (!selectedChat || !otherUser) {
    return (
      <div className="chat-window d-flex align-items-center justify-content-center text-muted">
        Select a chat from the left to start messaging.
      </div>
    );
  }

  if (!socket) {
    return (
      <div className="chat-window d-flex align-items-center justify-content-center text-muted">
        Connecting to chat server...
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-avatar">
          {otherUser.name.charAt(0).toUpperCase()}
        </div>
        <div className="chat-header-text">
          <div className="chat-header-name">{otherUser.name}</div>
          <div className="chat-header-email">
            {otherUser.email} • {isOtherTyping ? "typing..." : "online"}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-body">
        {messages.map((m) => (
          <MessageBubble
            key={m._id}
            text={m.text}
            time={m.time}
            fromMe={m.sender && m.sender._id === currentUser._id}
          />
        ))}

        {isOtherTyping && (
          <div className="typing-indicator">
            {otherUser.name} is typing...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <MessageInput onSend={handleSend} onTyping={handleTypingChange} />
      </div>
    </div>
  );
}

export default ChatWindow;
