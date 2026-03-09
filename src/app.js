const express = require('express');
const cors = require('cors');

const authRoutes     = require('./routes/auth.routes');
const exerciseRoutes = require('./routes/exercise.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const sessionRoutes  = require('./routes/session.routes');
const errorHandler   = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'HealthSphere API is running' });
});

// API Routes
app.use('/api/auth',      authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/sessions',  sessionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
