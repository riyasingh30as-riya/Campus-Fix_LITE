import StatusChip from './StatusChip';

function ticketId(id) {
  return `CFX-${id.slice(-6).toUpperCase()}`;
}

function formatTime(dt) {
  return new Date(dt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TicketBoard({ complaints, onSelect, emptyTitle, emptyBody }) {
  if (!complaints.length) {
    return (
      <div className="board">
        <div className="empty-state">
          <h3>{emptyTitle || 'No tickets on the board'}</h3>
          <p>{emptyBody || 'Nothing to show yet.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="board">
      <div className="board__head">
        <span>Ticket</span>
        <span>Category</span>
        <span>Description</span>
        <span>Priority</span>
        <span>Status</span>
        <span>Updated</span>
      </div>
      {complaints.map((c) => (
        <div className="ticket-row" key={c._id} onClick={() => onSelect(c)}>
          <span className="ticket-id">{ticketId(c._id)}</span>
          <span className="ticket-category">{c.category}</span>
          <span className="ticket-desc">{c.description}</span>
          <span className="priority-tag">{c.priority}</span>
          <StatusChip status={c.status} />
          <span className="ticket-time">{formatTime(c.updatedAt)}</span>
        </div>
      ))}
    </div>
  );
}

export { ticketId, formatTime };
