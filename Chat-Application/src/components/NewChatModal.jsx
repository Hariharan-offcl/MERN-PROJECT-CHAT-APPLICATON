// src/components/NewChatModal.jsx
function NewChatModal({ show, onClose, allUsers, loading, onStartChat }) {
  if (!show) return null;

  return (
    <div className="new-chat-backdrop">
      <div className="new-chat-modal">
        <div className="new-chat-header">
          <div className="new-chat-title">New Chat</div>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="new-chat-body">
          {loading && (
            <div className="text-muted small">Loading users...</div>
          )}

          {!loading && allUsers.length === 0 && (
            <div className="text-muted small">
              No other users available.
            </div>
          )}

          {!loading &&
            allUsers.map((user) => (
              <div
                key={user._id}
                className="new-chat-item"
                onClick={() => onStartChat(user)}
              >
                <div className="chat-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="chat-item-name">{user.name}</div>
                  <div className="chat-item-email">{user.email}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default NewChatModal;
