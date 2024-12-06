const Emission = require('../models/emissionModel');

// Add emission data
const addEmission = async (req, res) => {
    try {
        const userId = req.user.id;
        const emissionData = { ...req.body, userId };
        
        const emission = await Emission.create(emissionData);
        res.status(201).json({
            message: 'Emission data added successfully',
            emission
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error adding emission data',
            details: error.message
        });
    }
};

// Update emission data
const updateEmission = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const emission = await Emission.findOne({
            where: { id, userId }
        });

        if (!emission) {
            return res.status(404).json({
                error: 'Emission data not found or unauthorized'
            });
        }

        await emission.update(req.body);
        
        res.status(200).json({
            message: 'Emission data updated successfully',
            emission
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error updating emission data',
            details: error.message
        });
    }
};

// Get all emissions for a user
const getEmissions = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const emissions = await Emission.findAll({
            where: { userId }
        });

        res.status(200).json(emissions);
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving emission data',
            details: error.message
        });
    }
};

// Delete emission data
const deleteEmission = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const emission = await Emission.findOne({
            where: { id, userId }
        });

        if (!emission) {
            return res.status(404).json({
                error: 'Emission data not found or unauthorized'
            });
        }

        await emission.destroy();
        
        res.status(200).json({
            message: 'Emission data deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error deleting emission data',
            details: error.message
        });
    }
};

module.exports = {
    addEmission,
    updateEmission,
    getEmissions,
    deleteEmission
};
