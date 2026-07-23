import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    hostel: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-screen__hero">
        <div className="auth-screen__brand">CampusFix Lite</div>
        <div className="auth-screen__headline">
          Report it once. Track it until it's fixed.
        </div>
        <div className="auth-screen__board">
          PENDING <span>→</span> APPROVED <span>→</span> IN PROGRESS
          <br />
          <span>→</span> RESOLVED
        </div>
      </div>
      <div className="auth-screen__panel">
        <div className="auth-card panel panel--pad">
          <h2>Create your account</h2>
          <p className="subtitle">For students only. Admin accounts are provisioned separately.</p>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Roll number</label>
                <input
                  value={form.rollNumber}
                  onChange={(e) => update('rollNumber', e.target.value)}
                />
              </div>
              <div className="field">
                <label>Hostel</label>
                <input value={form.hostel} onChange={(e) => update('hostel', e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <div className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">
              <button type="button">Sign in</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
