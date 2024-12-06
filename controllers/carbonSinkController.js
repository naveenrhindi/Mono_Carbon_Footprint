const sequelize = require('../config/db');
const CarbonSink = require('../models/carbonSinkModel');

// Add single carbon sink
const addCarbonSink = async (req, res) => {
    try {
        console.log('Request body received:', req.body);
        
        // Validate required fields
        if (!req.body.type) {
            return res.status(400).json({
                error: 'Validation error',
                details: 'Type is required'
            });
        }

        if (!req.body.location) {
            return res.status(400).json({
                error: 'Validation error',
                details: 'Location is required'
            });
        }

        const userId = req.user.id;
        const sinkData = {
            userId,
            type: req.body.type,
            location: req.body.location,
            creationDate: req.body.creationDate || new Date()
        };

        // Add type-specific data
        switch (req.body.type) {
            case 'Afforestation':
                if (!req.body.afforestation) {
                    return res.status(400).json({
                        error: 'Validation error',
                        details: 'Afforestation data is required for type Afforestation'
                    });
                }
                sinkData.afforestation = req.body.afforestation;
                break;
            case 'Biodiversity Conservation':
                if (!req.body.biodiversityConservation) {
                    return res.status(400).json({
                        error: 'Validation error',
                        details: 'Biodiversity Conservation data is required'
                    });
                }
                sinkData.biodiversityConservation = req.body.biodiversityConservation;
                break;
            case 'Green Technology':
                if (!req.body.greenTechnology) {
                    return res.status(400).json({
                        error: 'Validation error',
                        details: 'Green Technology data is required'
                    });
                }
                sinkData.greenTechnology = req.body.greenTechnology;
                break;
            default:
                return res.status(400).json({
                    error: 'Invalid sink type',
                    details: 'Type must be one of: Afforestation, Biodiversity Conservation, Green Technology'
                });
        }

        console.log('Processed sink data:', sinkData);

        const carbonSink = await CarbonSink.create(sinkData);
        
        console.log('Created carbon sink:', carbonSink.toJSON());

        res.status(201).json({
            message: 'Carbon sink added successfully',
            carbonSink
        });
    } catch (error) {
        console.error('Error in addCarbonSink:', error);
        res.status(500).json({
            error: 'Error adding carbon sink',
            details: error.message
        });
    }
};

// Add multiple carbon sinks
const addMultipleCarbonSinks = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        console.log('Received request for multiple carbon sinks');
        const { sinks } = req.body;
        
        if (!Array.isArray(sinks)) {
            throw new Error('Sinks must be provided as an array');
        }

        if (sinks.length === 0) {
            throw new Error('At least one sink must be provided');
        }

        console.log(`Processing ${sinks.length} carbon sinks`);
        
        const createdSinks = [];
        
        for (const sink of sinks) {
            // Validate each sink
            if (!sink.type || !sink.location) {
                throw new Error('Each sink must have type and location');
            }

            const userId = req.user.id;
            const sinkData = {
                ...sink,
                userId,
                creationDate: sink.creationDate || new Date()
            };

            console.log('Creating sink with data:', JSON.stringify(sinkData, null, 2));

            // Create sink within transaction
            const createdSink = await CarbonSink.create(sinkData, { transaction: t });
            createdSinks.push(createdSink);
            
            console.log(`Created sink: ${createdSink.id}`);
        }

        // Commit transaction if all sinks are created successfully
        await t.commit();
        console.log('All sinks created successfully');

        res.status(201).json({
            success: true,
            message: 'Carbon sinks created successfully',
            data: createdSinks
        });

    } catch (error) {
        console.error('Error creating multiple carbon sinks:', error);
        await t.rollback();
        
        res.status(400).json({
            success: false,
            message: 'Failed to create carbon sinks',
            error: error.message
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
    getCarbonSinks,
    updateCarbonSink,
    deleteCarbonSink,
    addMultipleCarbonSinks
};
