// src/components/MessageInput.jsx
import { useState } from "react";

function MessageInput({ onSend, onTyping }) {
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    const v = e.target.value;
    setValue(v);

    if (onTyping) {
      // user is typing if there is non-empty text
      onTyping(v.trim().length > 0);
    }
  };

  const handleKeyDown = (e) => {
    // Enter to send (Shift+Enter for new line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;

    onSend(text);
    setValue("");
    if (onTyping) onTyping(false); // stop typing when message sent
  };

  return (
    <div className="d-flex">
      <textarea
        className="form-control form-control-sm me-2"
        rows={1}
        style={{ resize: "none" }}
        placeholder="Type a message"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button className="btn btn-success btn-sm" onClick={handleSend}>
        Send
      </button>
    </div>
  );
}

export default MessageInput;
