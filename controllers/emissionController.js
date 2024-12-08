const Emission = require('../models/emissionModel');
const CarbonSink = require('../models/carbonSinkModel');

// Emission factors
const EMISSION_FACTORS = {
    excavation: {
        coal: 2.42,     // kg CO2e per kg coal
        diesel: 2.68,   // kg CO2e per liter diesel
        petrol: 2.31,   // kg CO2e per liter petrol
        'natural gas': 2.75,   // kg CO2e per m3 natural gas
        method: {
            'Surface Mining': 1.2,    // Additional factor for surface mining
            'Underground Mining': 1.5  // Additional factor for underground mining
        }
    },
    transportation: {
        diesel: 2.68,   // kg CO2e per liter
        petrol: 2.31,   // kg CO2e per liter
        electric: 0.5,   // kg CO2e per kWh
        'natural gas': 2.75,   // kg CO2e per m3 natural gas
        mode: {
            'Truck': 1.2,      // Additional factor for truck transport
            'Rail': 0.8        // Additional factor for rail transport (more efficient)
        }
    },
    equipment: {
        diesel: 2.68,   // kg CO2e per liter
        electric: 0.5,   // kg CO2e per kWh
        'natural gas': 2.75,   // kg CO2e per m3 natural gas
        type: {
            'Excavator': 1.3,  // Equipment-specific factors
            'Loader': 1.2,
            'Drill': 1.1
        }
    },
    methane: 25,        // Global warming potential of methane
    utilizationMethod: {
        'Power Generation': 0.7,           // Efficiency factor for power generation
        'Ventilation Air Methane': 0.85    // Efficiency factor for VAM
    }
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
                const { 
                    coalAmount = 0, 
                    fuelType = 'diesel', 
                    distance = 0,
                    method = 'Surface Mining'
                } = emission.excavation || {};
                
                const fuelEmissionFactor = EMISSION_FACTORS.excavation[fuelType?.toLowerCase()] || EMISSION_FACTORS.excavation.diesel;
                const methodFactor = EMISSION_FACTORS.excavation.method[method] || 1;
                
                excavationEmissions = (coalAmount * EMISSION_FACTORS.excavation.coal * methodFactor) +
                                   (distance * fuelEmissionFactor);
            }

            // Calculate transportation emissions
            let transportationEmissions = 0;
            if (emission.transportation) {
                const { 
                    coalTransported = 0, 
                    fuelType = 'diesel', 
                    distancePerTrip = 0, 
                    tripsPerDay = 0,
                    mode = 'Truck'
                } = emission.transportation || {};
                
                const totalDistance = distancePerTrip * tripsPerDay;
                const fuelEmissionFactor = EMISSION_FACTORS.transportation[fuelType?.toLowerCase()] || EMISSION_FACTORS.transportation.diesel;
                const modeFactor = EMISSION_FACTORS.transportation.mode[mode] || 1;
                
                transportationEmissions = (totalDistance * fuelEmissionFactor * modeFactor) +
                                       (coalTransported * 0.1); // Base emission from coal transport
            }

            // Calculate equipment emissions
            let equipmentEmissions = 0;
            if (emission.equipmentUsage) {
                const { 
                    operatingHours = 0, 
                    fuelType = 'diesel', 
                    fuelConsumptionPerHour = 0,
                    type = 'Excavator'
                } = emission.equipmentUsage || {};
                
                const fuelEmissionFactor = EMISSION_FACTORS.equipment[fuelType?.toLowerCase()] || EMISSION_FACTORS.equipment.diesel;
                const equipmentFactor = EMISSION_FACTORS.equipment.type[type] || 1;
                
                equipmentEmissions = operatingHours * fuelConsumptionPerHour * 
                                   fuelEmissionFactor * equipmentFactor;
            }

            // Calculate methane emissions
            let methaneEmissions = 0;
            if (emission.methaneEntrapment) {
                const { 
                    dischargeAmount = 0, 
                    captureRate = 0,
                    utilizationMethod = 'Power Generation',
                    conversionEfficiency = 0 
                } = emission.methaneEntrapment || {};
                
                const methodEfficiency = EMISSION_FACTORS.utilizationMethod[utilizationMethod] || 1;
                const effectiveDischarge = dischargeAmount * (1 - (captureRate / 100));
                const utilizationFactor = 1 - ((conversionEfficiency / 100) * methodEfficiency);
                
                methaneEmissions = effectiveDischarge * EMISSION_FACTORS.methane * utilizationFactor;
            }

            // Ensure all values are numbers and not NaN
            return {
                excavation: Number(acc.excavation || 0) + Number(excavationEmissions || 0),
                transportation: Number(acc.transportation || 0) + Number(transportationEmissions || 0),
                equipment: Number(acc.equipment || 0) + Number(equipmentEmissions || 0),
                methane: Number(acc.methane || 0) + Number(methaneEmissions || 0)
            };
        }, {
            excavation: 0,
            transportation: 0,
            equipment: 0,
            methane: 0
        });

        // Format emission values to 2 decimal places
        const formattedEmissions = {
            emissionsBySource: {
                excavation: Number(totalEmissions.excavation).toFixed(2),
                transportation: Number(totalEmissions.transportation).toFixed(2),
                equipment: Number(totalEmissions.equipment).toFixed(2),
                methane: Number(totalEmissions.methane).toFixed(2)
            }
        };

        // Calculate summary values
        const grossEmissions = Object.values(totalEmissions).reduce((a, b) => Number(a) + Number(b), 0);

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
                emissionsBySource: formattedEmissions.emissionsBySource,
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
            error: 'Error calculating emissions',
            details: error.message
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
                const { coalAmount, fuelType, distance, method } = emission.excavation;
                const fuelEmissionFactor = EMISSION_FACTORS.excavation[fuelType?.toLowerCase()] || EMISSION_FACTORS.excavation.diesel;
                const methodFactor = EMISSION_FACTORS.excavation.method[method] || 1;
                
                excavationEmissions = (coalAmount * EMISSION_FACTORS.excavation.coal * methodFactor) +
                                   (distance * fuelEmissionFactor);
            }

            // Calculate transportation emissions
            let transportationEmissions = 0;
            if (emission.transportation) {
                const { coalTransported, fuelType, distancePerTrip, tripsPerDay, mode } = emission.transportation;
                const totalDistance = distancePerTrip * tripsPerDay;
                const fuelEmissionFactor = EMISSION_FACTORS.transportation[fuelType?.toLowerCase()] || EMISSION_FACTORS.transportation.diesel;
                const modeFactor = EMISSION_FACTORS.transportation.mode[mode] || 1;
                
                transportationEmissions = (totalDistance * fuelEmissionFactor * modeFactor) +
                                       (coalTransported * 0.1); // Base emission from coal transport
            }

            // Calculate equipment emissions
            let equipmentEmissions = 0;
            if (emission.equipmentUsage) {
                const { operatingHours, fuelType, fuelConsumptionPerHour, type } = emission.equipmentUsage;
                const fuelEmissionFactor = EMISSION_FACTORS.equipment[fuelType?.toLowerCase()] || EMISSION_FACTORS.equipment.diesel;
                const equipmentFactor = EMISSION_FACTORS.equipment.type[type] || 1;
                
                equipmentEmissions = operatingHours * fuelConsumptionPerHour * 
                                   fuelEmissionFactor * equipmentFactor;
            }

            // Calculate methane emissions
            let methaneEmissions = 0;
            if (emission.methaneEntrapment) {
                const { dischargeAmount, captureRate, utilizationMethod, conversionEfficiency } = emission.methaneEntrapment;
                const methodEfficiency = EMISSION_FACTORS.utilizationMethod[utilizationMethod] || 1;
                const effectiveDischarge = dischargeAmount * (1 - (captureRate / 100));
                const utilizationFactor = 1 - ((conversionEfficiency / 100) * methodEfficiency);
                
                methaneEmissions = effectiveDischarge * EMISSION_FACTORS.methane * utilizationFactor;
            }

            const totalEmissions = excavationEmissions + transportationEmissions + 
                                 equipmentEmissions + methaneEmissions;

            return {
                id: emission.id,
                date: emission.createdAt,
                emissions: {
                    excavation: Number(excavationEmissions).toFixed(2),
                    transportation: Number(transportationEmissions).toFixed(2),
                    equipment: Number(equipmentEmissions).toFixed(2),
                    methane: Number(methaneEmissions).toFixed(2),
                    total: Number(totalEmissions).toFixed(2)
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
