const CarbonSink = require('../models/carbonSinkModel');

// Add carbon sink
const addCarbonSink = async (req, res) => {
    try {
        const userId = req.user.id;
        const sinkData = { ...req.body, userId };
        
        const carbonSink = await CarbonSink.create(sinkData);
        res.status(201).json({
            message: 'Carbon sink added successfully',
            carbonSink
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error adding carbon sink',
            details: error.message
        });
    }
};

// Update carbon sink
const updateCarbonSink = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const carbonSink = await CarbonSink.findOne({
            where: { id, userId }
        });

        if (!carbonSink) {
            return res.status(404).json({
                error: 'Carbon sink not found or unauthorized'
            });
        }

        await carbonSink.update(req.body);
        
        res.status(200).json({
            message: 'Carbon sink updated successfully',
            carbonSink
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error updating carbon sink',
            details: error.message
        });
    }
};

// Get all carbon sinks for a user
const getCarbonSinks = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const carbonSinks = await CarbonSink.findAll({
            where: { userId }
        });

        res.status(200).json(carbonSinks);
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving carbon sinks',
            details: error.message
        });
    }
};

// Delete carbon sink
const deleteCarbonSink = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const carbonSink = await CarbonSink.findOne({
            where: { id, userId }
        });

        if (!carbonSink) {
            return res.status(404).json({
                error: 'Carbon sink not found or unauthorized'
            });
        }

        await carbonSink.destroy();
        
        res.status(200).json({
            message: 'Carbon sink deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error deleting carbon sink',
            details: error.message
        });
    }
};

module.exports = {
    addCarbonSink,
    updateCarbonSink,
    getCarbonSinks,
    deleteCarbonSink
};
