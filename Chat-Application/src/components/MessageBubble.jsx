// src/components/MessageBubble.jsx
function MessageBubble({ text, fromMe, time }) {
  return (
    <div className={`message-row ${fromMe ? "me" : "other"}`}>
      <div className={`message-bubble ${fromMe ? "me" : "other"}`}>
        <span>{text}</span>
        {time && <span className="message-time">{time}</span>}
      </div>
    </div>
  );
}

export default MessageBubble;
