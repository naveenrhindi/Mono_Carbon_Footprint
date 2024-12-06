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

router.post('/add-emission', addEmission);
router.put('/update-emission/:id', updateEmission);
router.get('/get-emissions', getEmissions);
router.delete('/delete-emission/:id', deleteEmission);

router.get('/calculate-emissions', calculateEmissions);
router.get('/get-emission-calculations', getEmissionCalculations);

module.exports = router;
