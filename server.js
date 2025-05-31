require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fileUpload = require('express-fileupload');

// Import database configuration
const { testConnection, initDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const itineraryRoutes = require('./routes/itineraries');
const submissionRoutes = require('./routes/submissions');
const blogRoutes = require('./routes/blog');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(fileUpload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/blog', blogRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Test database connection and initialize
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize database (sync models)
    await initDatabase();
    
    // Start server
    const PORT = process.env.PORT || 5002;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;