
import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import socket from "../socket";

function ChatPage() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const room = "global";

  const [chats] = useState([
    { id: 1, name: "Global Chat", lastMessage: "Welcome!" },
  ]);

  const [selectedChat, setSelectedChat] = useState(chats[0]);

  const handleJoin = () => {
    if (!email.trim()) return;
    socket.emit("join_chat", { room, email });
    setJoined(true);
  };

  return (
    <div className="main-content container-fluid p-0">
      {!joined ? (
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ height: "100%" }}
        >
          <h4 className="mb-3 text-center">Enter your email to join chat</h4>
          <input
            type="email"
            className="form-control mb-2"
            style={{ maxWidth: "320px" }}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn btn-success" onClick={handleJoin}>
            Join Chat
          </button>
        </div>
      ) : (
        <div className="row g-0" style={{ height: "calc(100vh - 56px)" }}>
          <div className="col-12 col-md-4 col-lg-3 border-end bg-white">
            <Sidebar
              chats={chats}
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
            />
          </div>
          <div className="col-12 col-md-8 col-lg-9">
            <ChatWindow selectedChat={selectedChat} room={room} email={email} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
