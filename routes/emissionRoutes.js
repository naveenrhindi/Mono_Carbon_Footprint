const express = require('express');
const { addEmission, updateEmission, getEmissions, deleteEmission } = require('../controllers/emissionController');
const authenticate = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/add-emissions', authenticate, addEmission);
router.put('/update-emissions/:id', authenticate, updateEmission);
router.get('/get-emissions', authenticate, getEmissions);
router.delete('/delete-emissions/:id', authenticate, deleteEmission);

module.exports = router;
