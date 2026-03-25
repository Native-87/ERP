const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PerformanceReview = sequelize.define('PerformanceReview', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reviewDate: { type: DataTypes.DATEONLY, allowNull: false },
  reviewerId: { type: DataTypes.INTEGER }, 
  score: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
  comments: { type: DataTypes.TEXT }
});

module.exports = PerformanceReview;
