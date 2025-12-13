function MessageBubble({ text, fromMe }) {
  return (
    <div
      className={`d-flex mb-1 ${
        fromMe ? "justify-content-end" : "justify-content-start"
      }`}
    >
      <div
        className={`px-3 py-2 rounded-3 small shadow-sm ${
          fromMe ? "bg-success text-white" : "bg-white"
        }`}
        style={{ maxWidth: "70%" }}
      >
        {text}
      </div>
    </div>
  );
}

export default MessageBubble;
