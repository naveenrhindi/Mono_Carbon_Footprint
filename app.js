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
app.use(cors());
app.use(bodyParser.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/emissions', emissionRoutes);
app.use('/api/carbon-sinks', carbonSinkRoutes);

// Sync Database
sequelize.sync({ alter: true }).then(() => {
    console.log('Database synchronized and altered successfully');
}).catch(err => {
    console.error('Error syncing database:', err);
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
