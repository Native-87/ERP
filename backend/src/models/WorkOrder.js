const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkOrder = sequelize.define('WorkOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('alta', 'media', 'baja'),
    allowNull: false,
    defaultValue: 'media',
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'en_curso', 'esperando_repuesto', 'completada', 'cerrada'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  sector: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'User ID of the assigned worker',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  closed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  digital_signature: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Confirmation checkbox when closing',
  },
  signature_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'work_orders',
});

module.exports = WorkOrder;
