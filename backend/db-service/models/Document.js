const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => Math.random().toString(36).substr(2, 9)
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  size: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'application/pdf'
  },
  uploadedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('processing', 'completed', 'error'),
    defaultValue: 'processing'
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  extractedText: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  }
}, {
  tableName: 'documents',
  timestamps: true,
  createdAt: 'uploadedAt',
  updatedAt: 'updatedAt'
});

module.exports = Document;