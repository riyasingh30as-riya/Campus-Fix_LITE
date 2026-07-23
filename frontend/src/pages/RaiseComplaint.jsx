import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import api from '../api/axios';

const CATEGORIES = ['Electricity', 'Water', 'Wi-Fi', 'Hostel', 'Cleanliness', 'Infrastructure', 'Other'];

export default function RaiseComplaint() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (description.trim().length < 6) {
      setSuggestion(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.post('/complaints/suggest-category', { description });
        if (res.data.category && res.data.category !== 'Other') {
          setSuggestion(res.data);
        } else {
          setSuggestion(null);
        }
      } catch {
        // silently ignore - AI hint is a nice-to-have, not critical path
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [description]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!category) {
      setError('Please select a category');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description);
      formData.append('location', location);
      if (image) formData.append('image', image);

      await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit complaint');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <Topbar />
      <div className="page" style={{ maxWidth: 640 }}>
        <div className="page-header">
          <p className="page-header__eyebrow">New Ticket</p>
          <h1>Raise a complaint</h1>
          <p>Tell us what's wrong and where — we'll route it to the right desk.</p>
        </div>

        <div className="panel panel--pad">
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. The tube light in Room 214 has been flickering and now doesn't turn on at all."
                required
              />
            </div>

            {suggestion && (
              <div className="ai-hint">
                AI suggests category: <strong>{suggestion.category}</strong>
                <button type="button" onClick={() => setCategory(suggestion.category)}>
                  Use this
                </button>
              </div>
            )}

            <div className="field">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="" disabled>
                  Select a category
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Hostel Block C, Room 214"
                required
              />
            </div>

            <div className="field">
              <label>Photo (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
            </div>

            <button className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit complaint'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
