const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeaveRequest = sequelize.define('LeaveRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.ENUM('Vacaciones', 'Enfermedad', 'Estudio', 'Maternidad/Paternidad', 'Otro'), allowNull: false },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('Pendiente', 'Aprobada', 'Rechazada'), defaultValue: 'Pendiente' },
  reason: { type: DataTypes.TEXT }
});

module.exports = LeaveRequest;
