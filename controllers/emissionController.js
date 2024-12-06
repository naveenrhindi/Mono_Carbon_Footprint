const Emission = require('../models/emissionModel');
const CarbonSink = require('../models/carbonSinkModel');

// Emission factors
const EMISSION_FACTORS = {
    excavation: {
        coal: 2.42,     // kg CO2e per kg coal
        diesel: 2.68,   // kg CO2e per liter diesel
        petrol: 2.31    // kg CO2e per liter petrol
    },
    transportation: {
        diesel: 2.68,   // kg CO2e per liter
        petrol: 2.31,   // kg CO2e per liter
        electric: 0.5    // kg CO2e per kWh
    },
    equipment: {
        diesel: 2.68,   // kg CO2e per liter
        electric: 0.5    // kg CO2e per kWh
    },
    methane: 25         // Global warming potential of methane
};

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

// Calculate emissions using existing data
const calculateEmissions = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all emissions for this user
        const emissions = await Emission.findAll({
            where: { userId },
            attributes: [
                'excavation',
                'transportation',
                'equipmentUsage',
                'methaneEntrapment'
            ]
        });

        console.log('Found emissions:', JSON.stringify(emissions, null, 2));

        // Calculate total emissions by type
        const totalEmissions = emissions.reduce((acc, emission) => {
            // Calculate excavation emissions
            let excavationEmissions = 0;
            if (emission.excavation) {
                const { coalAmount = 0, fuelType = 'diesel', distance = 0 } = emission.excavation || {};
                excavationEmissions = (coalAmount * EMISSION_FACTORS.excavation.coal) +
                                   (distance * EMISSION_FACTORS.excavation[fuelType?.toLowerCase() || 'diesel']);
            }

            // Calculate transportation emissions
            let transportationEmissions = 0;
            if (emission.transportation) {
                const { 
                    coalTransported = 0, 
                    fuelType = 'diesel', 
                    distancePerTrip = 0, 
                    tripsPerDay = 0 
                } = emission.transportation || {};
                const totalDistance = distancePerTrip * tripsPerDay;
                transportationEmissions = (totalDistance * EMISSION_FACTORS.transportation[fuelType?.toLowerCase() || 'diesel']) +
                                       (coalTransported * 0.1);
            }

            // Calculate equipment emissions
            let equipmentEmissions = 0;
            if (emission.equipmentUsage) {
                const { 
                    operatingHours = 0, 
                    fuelType = 'diesel', 
                    fuelConsumptionPerHour = 0 
                } = emission.equipmentUsage || {};
                equipmentEmissions = operatingHours * fuelConsumptionPerHour * 
                                   EMISSION_FACTORS.equipment[fuelType?.toLowerCase() || 'diesel'];
            }

            // Calculate methane emissions
            let methaneEmissions = 0;
            if (emission.methaneEntrapment) {
                const { dischargeAmount = 0 } = emission.methaneEntrapment || {};
                methaneEmissions = dischargeAmount * EMISSION_FACTORS.methane;
            }

            return {
                excavation: (acc.excavation || 0) + (excavationEmissions || 0),
                transportation: (acc.transportation || 0) + (transportationEmissions || 0),
                equipment: (acc.equipment || 0) + (equipmentEmissions || 0),
                methane: (acc.methane || 0) + (methaneEmissions || 0)
            };
        }, {
            excavation: 0,
            transportation: 0,
            equipment: 0,
            methane: 0
        });

        // Calculate total of all emissions
        const grossEmissions = Object.values(totalEmissions).reduce((a, b) => (a || 0) + (b || 0), 0);

        // Fetch carbon sinks for this user
        const carbonSinks = await CarbonSink.findAll({
            where: { userId }
        });

        // Calculate total sink reductions
        const sinkReductions = carbonSinks.reduce((total, sink) => {
            let reduction = 0;
            switch (sink.type) {
                case 'Afforestation':
                    reduction = (sink.afforestation?.area || 0) * 0.5;
                    break;
                case 'Biodiversity Conservation':
                    reduction = sink.biodiversityConservation?.carbonSequestration || 0;
                    break;
                case 'Green Technology':
                    reduction = sink.greenTechnology?.emissionReduction || 0;
                    break;
            }
            return (total || 0) + (reduction || 0);
        }, 0);

        // Calculate net emissions
        const netEmissions = Math.max(0, grossEmissions - sinkReductions);

        console.log('Calculation results:', {
            totalEmissions,
            grossEmissions,
            sinkReductions,
            netEmissions
        });

        res.status(200).json({
            success: true,
            data: {
                emissionsBySource: {
                    excavation: (totalEmissions.excavation || 0).toFixed(2),
                    transportation: (totalEmissions.transportation || 0).toFixed(2),
                    equipment: (totalEmissions.equipment || 0).toFixed(2),
                    methane: (totalEmissions.methane || 0).toFixed(2)
                },
                summary: {
                    grossEmissions: (grossEmissions || 0).toFixed(2),
                    sinkReductions: (sinkReductions || 0).toFixed(2),
                    netEmissions: (netEmissions || 0).toFixed(2)
                },
                unit: 'kg CO2e'
            }
        });

    } catch (error) {
        console.error('Error calculating emissions:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating emissions',
            error: error.message
        });
    }
};

// Get emission calculation history
const getEmissionCalculations = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fetch all emissions
        const emissions = await Emission.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            attributes: [
                'id',
                'excavation',
                'transportation',
                'equipmentUsage',
                'methaneEntrapment',
                'createdAt'
            ]
        });

        // Calculate emissions for each record
        const calculationHistory = emissions.map(emission => {
            // Calculate excavation emissions
            let excavationEmissions = 0;
            if (emission.excavation) {
                const { coalAmount, fuelType, distance } = emission.excavation;
                excavationEmissions = (coalAmount * EMISSION_FACTORS.excavation.coal) +
                                   (distance * EMISSION_FACTORS.excavation[fuelType.toLowerCase()]);
            }

            // Calculate transportation emissions
            let transportationEmissions = 0;
            if (emission.transportation) {
                const { coalTransported, fuelType, distancePerTrip, tripsPerDay } = emission.transportation;
                const totalDistance = distancePerTrip * tripsPerDay;
                transportationEmissions = (totalDistance * EMISSION_FACTORS.transportation[fuelType.toLowerCase()]) +
                                       (coalTransported * 0.1);
            }

            // Calculate equipment emissions
            let equipmentEmissions = 0;
            if (emission.equipmentUsage) {
                const { operatingHours, fuelType, fuelConsumptionPerHour } = emission.equipmentUsage;
                equipmentEmissions = operatingHours * fuelConsumptionPerHour * 
                                   EMISSION_FACTORS.equipment[fuelType.toLowerCase()];
            }

            // Calculate methane emissions
            let methaneEmissions = 0;
            if (emission.methaneEntrapment) {
                const { dischargeAmount } = emission.methaneEntrapment;
                methaneEmissions = dischargeAmount * EMISSION_FACTORS.methane;
            }

            const totalEmissions = excavationEmissions + transportationEmissions + 
                                 equipmentEmissions + methaneEmissions;

            return {
                id: emission.id,
                date: emission.createdAt,
                emissions: {
                    excavation: excavationEmissions.toFixed(2),
                    transportation: transportationEmissions.toFixed(2),
                    equipment: equipmentEmissions.toFixed(2),
                    methane: methaneEmissions.toFixed(2),
                    total: totalEmissions.toFixed(2)
                },
                unit: 'kg CO2e'
            };
        });

        res.status(200).json({
            success: true,
            data: calculationHistory
        });

    } catch (error) {
        console.error('Error fetching emission calculations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching emission calculations',
            error: error.message
        });
    }
};

module.exports = {
    addEmission,
    getEmissions,
    updateEmission,
    deleteEmission,
    calculateEmissions,
    getEmissionCalculations
};
