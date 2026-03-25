const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Provider = sequelize.define('Provider', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  contactName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
  phone: { type: DataTypes.STRING },
  taxId: { type: DataTypes.STRING }, // CUIT/RUT/RFC
  rating: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 }, defaultValue: 5 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = Provider;
