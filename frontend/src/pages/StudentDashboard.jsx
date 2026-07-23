import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../components/Topbar';
import TicketBoard from '../components/TicketBoard';
import ComplaintDrawer from '../components/ComplaintDrawer';
import api from '../api/axios';

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await api.get('/complaints/mine');
    setComplaints(res.data.complaints);
    setLoading(false);
  }

  const counts = complaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="app-shell">
      <Topbar />
      <div className="page">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p className="page-header__eyebrow">My Board</p>
            <h1>Your complaints</h1>
            <p>
              {complaints.length} filed · {counts['Resolved'] || 0} resolved ·{' '}
              {counts['Pending'] || 0} pending
            </p>
          </div>
          <Link to="/dashboard/new">
            <button className="btn btn-primary">+ Raise a complaint</button>
          </Link>
        </div>

        {!loading && (
          <TicketBoard
            complaints={complaints}
            onSelect={setSelected}
            emptyTitle="No complaints yet"
            emptyBody="Raised issues will appear here so you can track their status in real time."
          />
        )}
      </div>

      {selected && (
        <ComplaintDrawer
          complaint={selected}
          isAdmin={false}
          onClose={() => setSelected(null)}
          onUpdated={() => {}}
        />
      )}
    </div>
  );
}
