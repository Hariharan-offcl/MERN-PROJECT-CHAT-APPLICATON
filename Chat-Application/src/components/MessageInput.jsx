import { useState } from "react";

function MessageInput({ onSend, onTypingChange }) {
  const [value, setValue] = useState("");

  const handleSendClick = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
    onTypingChange && onTypingChange(false);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    onTypingChange && onTypingChange(newValue.length > 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="d-flex gap-2">
      <textarea
        className="form-control form-control-sm"
        rows={1}
        placeholder="Type a message"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button className="btn btn-success btn-sm" onClick={handleSendClick}>
        Send
      </button>
    </div>
  );
}

export default MessageInput;
