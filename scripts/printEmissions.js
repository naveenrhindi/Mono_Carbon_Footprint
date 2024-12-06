const { Sequelize } = require('sequelize');
const Emission = require('../models/emissionModel');

async function printEmissions() {
    try {
        const emissions = await Emission.findAll();
        console.log('All Emissions:', JSON.stringify(emissions, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

printEmissions();
