const express = require('express');
const router = express.Router();
const { 
    addCarbonSink, 
    addMultipleCarbonSinks,
    updateCarbonSink, 
    getCarbonSinks, 
    deleteCarbonSink 
} = require('../controllers/carbonSinkController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes
router.use(authMiddleware);

// Debug middleware
router.use((req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    console.log('Request Method:', req.method);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    next();
});

// Routes
router.post('/add-multiple-carbon-sinks', addMultipleCarbonSinks);  
router.post('/add-carbon-sink', addCarbonSink);
router.put('/update-carbon-sink/:id', updateCarbonSink);
router.get('/get-carbon-sinks', getCarbonSinks);
router.delete('/delete-carbon-sink/:id', deleteCarbonSink);

module.exports = router;
