const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  requestId: { type: DataTypes.INTEGER },
  providerId: { type: DataTypes.INTEGER, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('Emitida', 'Pendiente de Pago', 'Pagada', 'Mercadería Recibida', 'Cancelada'), defaultValue: 'Emitida' },
  expectedDeliveryDate: { type: DataTypes.DATEONLY },
  items: { type: DataTypes.JSON }, // Arreglo JSON [{productId, quantity, unitPrice}]
});

module.exports = PurchaseOrder;
