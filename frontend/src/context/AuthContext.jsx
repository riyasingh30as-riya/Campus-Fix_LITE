import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('campusfix_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem('campusfix_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('campusfix_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('campusfix_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('campusfix_token');
        localStorage.removeItem('campusfix_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    persist(res.data);
    return res.data.user;
  }

  async function register(payload) {
    const res = await api.post('/auth/register', payload);
    persist(res.data);
    return res.data.user;
  }

  function persist({ token, user: u }) {
    localStorage.setItem('campusfix_token', token);
    localStorage.setItem('campusfix_user', JSON.stringify(u));
    setUser(u);
  }

  function logout() {
    localStorage.removeItem('campusfix_token');
    localStorage.removeItem('campusfix_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
