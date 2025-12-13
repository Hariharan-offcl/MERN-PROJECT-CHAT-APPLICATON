function Sidebar({ chats, selectedChat, onSelectChat }) {
  return (
    <div className="d-flex flex-column h-100 bg-white border-end">
      <div className="border-bottom p-3">
        <h6 className="mb-0 text-success fw-semibold">Chats</h6>
      </div>

      <div className="flex-grow-1 overflow-auto">
        {chats.map((chat) => {
          const isActive = selectedChat && selectedChat.id === chat.id;
          return (
            <button
              key={chat.id}
              className={`w-100 text-start p-3 border-0 border-bottom ${
                isActive ? "bg-success bg-opacity-10" : "bg-white"
              }`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="fw-semibold small text-dark">{chat.name}</div>
              <div className="small text-muted text-truncate">
                {chat.lastMessage}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;
