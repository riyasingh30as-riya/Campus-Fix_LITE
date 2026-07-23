import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import TicketBoard from '../components/TicketBoard';
import ComplaintDrawer from '../components/ComplaintDrawer';
import api from '../api/axios';

const STATUSES = ['Pending', 'Approved', 'In Progress', 'Resolved', 'Rejected'];
const CATEGORIES = ['Electricity', 'Water', 'Wi-Fi', 'Hostel', 'Cleanliness', 'Infrastructure', 'Other'];

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    const t = setTimeout(loadComplaints, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, category, q]);

  async function loadStats() {
    const res = await api.get('/complaints/stats');
    setStats(res.data);
  }

  async function loadComplaints() {
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    if (category) params.category = category;
    if (q) params.q = q;
    const res = await api.get('/complaints', { params });
    setComplaints(res.data.complaints);
    setLoading(false);
  }

  function handleUpdated(updated) {
    setComplaints((list) => list.map((c) => (c._id === updated._id ? updated : c)));
    setSelected(updated);
    loadStats();
  }

  return (
    <div className="app-shell">
      <Topbar />
      <div className="page">
        <div className="page-header">
          <p className="page-header__eyebrow">Admin Board</p>
          <h1>Complaint operations</h1>
          <p>Filter, prioritize, and resolve issues raised across campus.</p>
        </div>

        {stats && (
          <div className="stat-strip">
            <div className="stat-tile">
              <div className="stat-tile__count">{stats.total}</div>
              <div className="stat-tile__label">Total</div>
            </div>
            {STATUSES.map((s) => (
              <div className={`stat-tile stat-tile--${s.replace(/\s+/g, '-')}`} key={s}>
                <div className="stat-tile__count">{stats.byStatus[s] || 0}</div>
                <div className="stat-tile__label">{s}</div>
              </div>
            ))}
          </div>
        )}

        <div className="filter-bar">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search description or location…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {!loading && (
          <TicketBoard
            complaints={complaints}
            onSelect={setSelected}
            emptyTitle="No matching complaints"
            emptyBody="Try adjusting your filters."
          />
        )}
      </div>

      {selected && (
        <ComplaintDrawer
          complaint={selected}
          isAdmin={true}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
