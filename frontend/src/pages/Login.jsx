import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoEmail = 'demo.admin@campusfix.edu';
  const demoPassword = 'CampusFix123!';

  function useDemoLogin() {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-screen__hero">
        <div className="auth-screen__brand">CampusFix Lite</div>
        <div className="auth-screen__headline">
          Every campus issue, tracked from report to resolution.
        </div>
        <div className="auth-screen__board">
          ELECTRICITY <span>·</span> WATER <span>·</span> WI-FI
          <br />
          HOSTEL <span>·</span> CLEANLINESS <span>·</span> INFRASTRUCTURE
        </div>
      </div>
      <div className="auth-screen__panel">
        <div className="auth-card panel panel--pad">
          <h2>Sign in</h2>
          <p className="subtitle">Students and admins use the same login.</p>
          {error && <div className="error-banner">{error}</div>}
          <div className="demo-login">
            <div>
              <strong>Demo admin access</strong>
              <span>{demoEmail}</span>
              <span>{demoPassword}</span>
            </div>
            <button type="button" className="btn btn-ghost" onClick={useDemoLogin}>
              Use demo login
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <div className="auth-switch">
            New student?{' '}
            <Link to="/register">
              <button type="button">Create an account</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
