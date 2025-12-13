export default function Notifications({ items = [] }) {
  return (
    <div className="notifications">
      {items.length === 0 ? (
        <div className="empty">No notifications</div>
      ) : (
        <ul>
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
