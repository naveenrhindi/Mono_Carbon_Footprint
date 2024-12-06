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
            isIn: [['Afforestation']] // Add more types as needed
        }
    },
    afforestation: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
            isValidAfforestation(value) {
                const required = ['area', 'treePlantingRate', 'treeType'];
                required.forEach(field => {
                    if (!(field in value)) {
                        throw new Error(`Missing required field in afforestation: ${field}`);
                    }
                });
            }
        }
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    creationDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true
        }
    }
});

// Establish relationship with User
CarbonSink.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(CarbonSink, { foreignKey: 'userId' });

module.exports = CarbonSink;
