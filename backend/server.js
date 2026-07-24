require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const User = require('./models/User');

const app = express();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'campusfix-dev-secret';

const configuredOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowOrigin = (origin) => {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, '');
  return configuredOrigins.includes(normalized) || /^(http:\/\/localhost|http:\/\/127\.0\.0\.1)/.test(normalized);
};

app.use(cors({ origin: allowOrigin, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Generic error handler (e.g. multer file errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5050;

async function ensureAdminAccount() {
  const email = (process.env.ADMIN_EMAIL || 'demo.admin@campusfix.edu').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'CampusFix123!';
  const name = process.env.ADMIN_NAME || 'CampusFix Demo Admin';

  if (!email || !password) return;

  const existing = await User.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name, email, passwordHash, role: 'admin' });
  console.log(`Admin account ensured: ${email}`);
}

connectDB()
  .then(async () => {
    await ensureAdminAccount();
    app.listen(PORT, () => console.log(`CampusFix Lite API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
