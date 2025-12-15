// src/pages/ChatPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initSocket, API_URL } from "../socket";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import NewChatModal from "../components/NewChatModal.jsx";

function ChatPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const [contacts, setContacts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingAllUsers, setLoadingAllUsers] = useState(true);

  const [selectedChat, setSelectedChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);

  const token = localStorage.getItem("token");

  // 1) Ensure user is logged in
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr || !token) {
      navigate("/login");
      return;
    }
    setCurrentUser(JSON.parse(userStr));
  }, [navigate, token]);

  // 2) Initialize socket AFTER token exists
  useEffect(() => {
    if (!token) return;
    const s = initSocket(token);
    setSocket(s);
  }, [token]);

  // 3) Fetch contacts (users I have chats with)
  useEffect(() => {
    if (!token) return;

    const fetchContacts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/my-contacts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          console.error("Error loading contacts:", data);
          return;
        }
        setContacts(data);
      } catch (err) {
        console.error("Error fetching contacts:", err);
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchContacts();
  }, [token]);

  // 4) Fetch all users (for New Chat modal)
  useEffect(() => {
    if (!token) return;

    const fetchAllUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          console.error("Error loading all users:", data);
          return;
        }
        setAllUsers(data);
      } catch (err) {
        console.error("Error fetching all users:", err);
      } finally {
        setLoadingAllUsers(false);
      }
    };

    fetchAllUsers();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // When user is selected for chat (from sidebar or modal)
  const handleSelectUser = async (otherUser) => {
    if (!token || !socket) return;

    try {
      const res = await fetch(`${API_URL}/api/chats/one-to-one`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otherUserId: otherUser._id }),
      });

      const chat = await res.json();

      if (!res.ok) {
        console.error("Error creating/getting chat:", chat);
        return;
      }

      // Join socket room
      socket.emit("join_chat", chat._id);

      // Update selected chat
      setSelectedChat({
        chatId: chat._id,
        otherUser,
        chatInfo: chat,
      });

      // Ensure this user is in contacts list
      setContacts((prev) => {
        const exists = prev.some((u) => u._id === otherUser._id);
        if (exists) return prev;
        return [...prev, otherUser];
      });
    } catch (err) {
      console.error("Error selecting user:", err);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="container-fluid p-0">
      {/* Top navbar styled like WhatsApp */}
      <nav className="navbar navbar-expand-lg navbar-whatsapp px-3">
        <span className="navbar-brand mb-0 h5">
           Chat Application
        </span>
        <div className="ms-auto d-flex align-items-center gap-3">
          <span className="small">
            {currentUser.name} ({currentUser.email})
          </span>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main layout */}
      <div className="row g-0 chat-app-main">
        {/* Sidebar */}
        <div className="col-12 col-md-4 col-lg-3">
          <Sidebar
            currentUser={currentUser}
            contacts={contacts}
            loading={loadingContacts}
            selectedChat={selectedChat}
            onSelectUser={handleSelectUser}
            onOpenNewChat={() => setShowNewChat(true)}
          />
        </div>

        {/* Chat window */}
        <div className="col-12 col-md-8 col-lg-9">
          <ChatWindow
            currentUser={currentUser}
            selectedChat={selectedChat}
            socket={socket}
          />
        </div>
      </div>

      {/* New Chat modal */}
      <NewChatModal
        show={showNewChat}
        onClose={() => setShowNewChat(false)}
        allUsers={allUsers}
        loading={loadingAllUsers}
        onStartChat={(user) => {
          setShowNewChat(false);
          handleSelectUser(user);
        }}
      />
    </div>
  );
}

export default ChatPage;
