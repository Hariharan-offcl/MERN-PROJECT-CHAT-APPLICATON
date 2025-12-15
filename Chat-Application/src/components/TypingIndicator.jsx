// src/components/TypingIndicator.jsx
function TypingIndicator({ name }) {
  return (
    <div className="text-muted small fst-italic mb-2">
      {name} is typing...
    </div>
  );
}

export default TypingIndicator;
