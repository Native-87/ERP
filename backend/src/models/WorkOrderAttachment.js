const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkOrderAttachment = sequelize.define('WorkOrderAttachment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  work_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  original_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  mimetype: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  path: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'work_order_attachments',
});

module.exports = WorkOrderAttachment;
