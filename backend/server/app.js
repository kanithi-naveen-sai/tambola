const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // In production, replace with specific origins
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Tambola backend is running' });
});

module.exports = app;
