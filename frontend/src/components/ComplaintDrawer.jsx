import { useState } from 'react';
import StatusChip from './StatusChip';
import { ticketId, formatTime } from './TicketBoard';
import api from '../api/axios';

const STATUS_FLOW = ['Pending', 'Approved', 'In Progress', 'Resolved', 'Rejected'];
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace(/\/api$/, '');

export default function ComplaintDrawer({ complaint, isAdmin, onClose, onUpdated }) {
  const [status, setStatus] = useState(complaint.status);
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await api.patch(`/complaints/${complaint._id}/status`, {
        status,
        remark: remark.trim() || undefined,
      });
      onUpdated(res.data.complaint);
      setRemark('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update this complaint');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-drawer" onClick={(e) => e.stopPropagation()}>
        <button className="detail-drawer__close" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <h2>{complaint.category}</h2>
        <span className="ticket-id">{ticketId(complaint._id)}</span>

        <StatusChip status={complaint.status} />

        <div className="section-divider">Details</div>
        <p>{complaint.description}</p>
        <p>
          <strong>Location:</strong> {complaint.location}
        </p>
        <p>
          <strong>Priority:</strong> {complaint.priority}
        </p>
        {complaint.suggestedCategory && complaint.suggestedCategory !== complaint.category && (
          <p style={{ fontSize: '0.82rem', color: '#4c5262' }}>
            AI suggested category: {complaint.suggestedCategory}
          </p>
        )}
        {isAdmin && complaint.student && (
          <p>
            <strong>Student:</strong> {complaint.student.name} ({complaint.student.email})
          </p>
        )}
        {complaint.imageUrl && (
          <img
            className="detail-image"
            src={`${API_ORIGIN}${complaint.imageUrl}`}
            alt="Complaint attachment"
          />
        )}

        <div className="section-divider">Timeline</div>
        <ul className="remark-list">
          {complaint.remarks
            .slice()
            .reverse()
            .map((r, i) => (
              <li key={i}>
                {r.text}
                <span className="remark-time">
                  {r.status ? `${r.status} · ` : ''}
                  {formatTime(r.createdAt || complaint.updatedAt)}
                </span>
              </li>
            ))}
        </ul>

        {isAdmin && (
          <div className="admin-actions">
            <h4>Update status</h4>
            {error && <div className="error-banner">{error}</div>}
            <div className="status-pill-row">
              {STATUS_FLOW.map((s) => (
                <button
                  key={s}
                  className={s === status ? 'active' : ''}
                  onClick={() => setStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="field">
              <label>Add a remark (visible to student)</label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="e.g. Assigned to maintenance team, expected fix by Friday."
              />
            </div>
            <button className="btn btn-primary btn-block" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save update'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
