const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseRequest = sequelize.define('PurchaseRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  estimatedCost: { type: DataTypes.DECIMAL(10, 2) },
  status: { type: DataTypes.ENUM('Pendiente', 'Aprobada', 'Rechazada'), defaultValue: 'Pendiente' },
  requestedBy: { type: DataTypes.INTEGER }, 
  justification: { type: DataTypes.TEXT },
  work_order_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'work_orders', key: 'id' } }
});

module.exports = PurchaseRequest;
