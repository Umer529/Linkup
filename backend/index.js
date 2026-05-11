require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const activityRoutes = require('./routes/activityRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const callRoutes = require('./routes/callRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const ActivityModel = require('./models/activityModel');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
}));
app.use(express.json());

app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Delete activities whose date is more than 7 days in the past
const runCleanup = async () => {
  try {
    await ActivityModel.deleteExpired();
    console.log('Expired activity cleanup complete');
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  runCleanup();
  // Run every 24 hours
  setInterval(runCleanup, 24 * 60 * 60 * 1000);
});
