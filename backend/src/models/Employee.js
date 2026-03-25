const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
  phone: { type: DataTypes.STRING },
  documentId: { type: DataTypes.STRING, unique: true },
  role: { type: DataTypes.STRING },
  sector: { type: DataTypes.STRING },
  hireDate: { type: DataTypes.DATEONLY },
  salary: { type: DataTypes.DECIMAL(10, 2) },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = Employee;
