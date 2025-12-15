// src/components/Sidebar.jsx
function Sidebar({
  currentUser,
  contacts,
  loading,
  selectedChat,
  onSelectUser,
  onOpenNewChat,
}) {
  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="d-flex align-items-center">
          <div className="chat-avatar">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="sidebar-header-title">{currentUser.name}</div>
            <div className="small text-muted">Online</div>
          </div>
        </div>
        <div className="sidebar-header-actions">
          <button
            className="btn btn-sm btn-outline-light new-chat-btn"
            onClick={onOpenNewChat}
            title="Start a new chat"
          >
            +
          </button>
        </div>
      </div>

      {/* Search bar (UI only) */}
      <div className="sidebar-search">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Search or start a new chat"
          disabled
        />
      </div>

      {/* Contacts list */}
      <div className="chat-list">
        {loading && (
          <div className="p-3 text-muted small">Loading contacts...</div>
        )}

        {!loading && contacts.length === 0 && (
          <div className="p-3 text-muted small">
            No chats yet. Click <strong>+</strong> to start one.
          </div>
        )}

        {contacts.map((user) => {
          const isActive =
            selectedChat &&
            selectedChat.otherUser &&
            selectedChat.otherUser._id === user._id;

          return (
            <div
              key={user._id}
              className={`chat-list-item ${isActive ? "active" : ""}`}
              onClick={() => onSelectUser(user)}
            >
              <div className="chat-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="chat-item-main">
                <div className="chat-item-name">{user.name}</div>
                <div className="chat-item-email">{user.email}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;
