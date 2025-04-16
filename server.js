const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/error');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/v1', require('./routes/auth'));
app.use('/api/v1', require('./routes/user'));
app.use('/api/v1/events', require('./routes/event')); // Added event routes


// Error handling middleware
app.use(errorHandler);

// Default route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Event Ticketing System API is running'
  });
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new Error('Route ${req.originalUrl} not found');
  error.statusCode = 404;
  next(error);
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('Server running in ${process.env.NODE_ENV} mode on port ${PORT}');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('Error: ${err.message}');
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server;