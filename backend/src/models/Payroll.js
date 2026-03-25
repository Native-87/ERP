const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payroll = sequelize.define('Payroll', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  period: { type: DataTypes.STRING, allowNull: false }, // ej '2023-10'
  baseSalary: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  bonus: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  deductions: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  netSalary: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('Pendiente', 'Pagado'), defaultValue: 'Pendiente' },
  paymentDate: { type: DataTypes.DATEONLY }
});

module.exports = Payroll;
