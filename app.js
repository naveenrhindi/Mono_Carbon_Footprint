const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const emissionRoutes = require('./routes/emissionRoutes');
const carbonSinkRoutes = require('./routes/carbonSinkRoutes');
require('dotenv').config();

const app = express();

// Middleware
// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Increase limits and timeouts
app.use(bodyParser.json({ 
    limit: '50mb',
    extended: true,
    parameterLimit: 50000
}));
app.use(bodyParser.urlencoded({ 
    limit: '50mb', 
    extended: true,
    parameterLimit: 50000 
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log('Incoming request:');
    console.log('  URL:', req.url);
    console.log('  Method:', req.method);
    console.log('  Headers:', req.headers);
    console.log('  Body:', req.body);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    next(err);
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/auth', userRoutes);
app.use('/api/emissions', emissionRoutes);
app.use('/api/carbon-sinks', carbonSinkRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Sync Database
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synchronized and altered successfully');
        
        // Start Server
        const PORT = process.env.PORT || 5001;
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        // Configure server timeouts
        server.timeout = 120000; // 2 minutes
        server.keepAliveTimeout = 120000;
        server.headersTimeout = 120000;

        // Handle server errors
        server.on('error', (error) => {
            console.error('Server error:', error);
            if (error.code === 'EADDRINUSE') {
                console.log('Port is busy, retrying...');
                setTimeout(() => {
                    server.close();
                    server.listen(PORT);
                }, 1000);
            }
        });
    })
    .catch(err => {
        console.error('Error syncing database:', err);
        process.exit(1);
    });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});
