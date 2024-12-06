const express = require('express');
const { addCarbonSink, updateCarbonSink, getCarbonSinks, deleteCarbonSink } = require('../controllers/carbonSinkController');
const authenticate = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/add-carbon-sinks', authenticate, addCarbonSink);
router.put('/update-carbon-sinks/:id', authenticate, updateCarbonSink);
router.get('/get-carbon-sinks', authenticate, getCarbonSinks);
router.delete('/delete-carbon-sinks/:id', authenticate, deleteCarbonSink);

module.exports = router;
