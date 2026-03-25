const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  checkIn: { type: DataTypes.TIME },
  checkOut: { type: DataTypes.TIME },
  status: { type: DataTypes.ENUM('Presente', 'Ausente', 'Tarde', 'Licencia'), defaultValue: 'Presente' },
  notes: { type: DataTypes.TEXT }
});

module.exports = Attendance;
