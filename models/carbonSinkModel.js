const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./userModel');

const CarbonSink = sequelize.define('CarbonSink', {
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
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Afforestation', 'Biodiversity Conservation', 'Green Technology']]
        }
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    creationDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    // Fields for Afforestation
    afforestation: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidAfforestation(value) {
                if (this.type === 'Afforestation') {
                    if (!value) throw new Error('Afforestation data required for type Afforestation');
                    const required = ['area', 'treePlantingRate', 'treeType'];
                    required.forEach(field => {
                        if (!(field in value)) {
                            throw new Error(`Missing required field in afforestation: ${field}`);
                        }
                    });
                }
            }
        }
    },
    // Fields for Biodiversity Conservation
    biodiversityConservation: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidBiodiversity(value) {
                if (this.type === 'Biodiversity Conservation') {
                    if (!value) throw new Error('Biodiversity data required for type Biodiversity Conservation');
                    const required = ['area', 'habitatType', 'carbonSequestration'];
                    required.forEach(field => {
                        if (!(field in value)) {
                            throw new Error(`Missing required field in biodiversity: ${field}`);
                        }
                    });
                }
            }
        }
    },
    // Fields for Green Technology
    greenTechnology: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidGreenTech(value) {
                if (this.type === 'Green Technology') {
                    if (!value) throw new Error('Green Technology data required for type Green Technology');
                    const required = ['technologyType', 'emissionReduction', 'energySource'];
                    required.forEach(field => {
                        if (!(field in value)) {
                            throw new Error(`Missing required field in green technology: ${field}`);
                        }
                    });
                }
            }
        }
    }
});

// Set up associations
CarbonSink.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

module.exports = CarbonSink;
