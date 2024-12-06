const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./userModel');

const Emission = sequelize.define('Emission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    excavation: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidExcavation(value) {
                if (value) {
                    const required = ['coalAmount', 'method', 'fuelType', 'distance', 'equipmentUsed'];
                    required.forEach(field => {
                        if (!(field in value)) {
                            throw new Error(`Missing required field in excavation: ${field}`);
                        }
                    });
                }
            }
        }
    },
    transportation: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidTransportation(value) {
                if (value) {
                    const required = ['coalTransported', 'mode', 'fuelType', 'distancePerTrip', 'vehicleCapacity', 'tripsPerDay'];
                    required.forEach(field => {
                        if (!(field in value)) {
                            throw new Error(`Missing required field in transportation: ${field}`);
                        }
                    });
                }
            }
        }
    },
    equipmentUsage: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidEquipment(value) {
                if (value) {
                    const required = ['type', 'fuelType', 'operatingHours', 'fuelConsumptionPerHour'];
                    required.forEach(field => {
                        if (!(field in value)) {
                            throw new Error(`Missing required field in equipmentUsage: ${field}`);
                        }
                    });
                }
            }
        }
    },
    methaneEntrapment: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidMethane(value) {
                if (value) {
                    const required = ['captureRate', 'utilizationMethod', 'dischargeAmount', 'conversionEfficiency'];
                    required.forEach(field => {
                        if (!(field in value)) {
                            throw new Error(`Missing required field in methaneEntrapment: ${field}`);
                        }
                    });
                }
            }
        }
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
});

// Establish relationship with User
Emission.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Emission, { foreignKey: 'userId' });

module.exports = Emission;
