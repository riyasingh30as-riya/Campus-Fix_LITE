import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__brand-mark">CampusFix Lite</span>
        <span className="topbar__brand-tag">Complaint Board</span>
      </div>
      {user && (
        <div className="topbar__user">
          <div>
            <div>{user.name}</div>
            <div className="topbar__user-role">{user.role}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
