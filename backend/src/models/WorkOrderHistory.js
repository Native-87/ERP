const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkOrderHistory = sequelize.define('WorkOrderHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  work_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  previous_status: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  new_status: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  changed_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'work_order_history',
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = WorkOrderHistory;
