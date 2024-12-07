const express = require('express');
const { 
    addEmission, 
    updateEmission, 
    getEmissions, 
    deleteEmission, 
    calculateEmissions, 
    getEmissionCalculations 
} = require('../controllers/emissionController');
const authenticate = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authenticate);

// Changed to plural for consistency
router.post('/add-emissions', addEmission);
router.put('/update-emissions/:id', updateEmission);
router.get('/get-emissions', getEmissions);
router.delete('/delete-emissions/:id', deleteEmission);

router.get('/calculate-emissions', calculateEmissions);
router.get('/get-emission-calculations', getEmissionCalculations);

module.exports = router;
