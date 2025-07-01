const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Analysis = sequelize.define('Analysis', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => Math.random().toString(36).substr(2, 9)
  },
  
  summary: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'analyses',
  timestamps: true,
  indexes: [
    {
      fields: ['created_at']
    }
    // TOUS les autres index supprimés car les colonnes n'existent pas
  ]
});

// Méthodes utilitaires
Analysis.prototype.getShortSummary = function(maxLength = 100) {
  return this.summary.length > maxLength 
    ? this.summary.substring(0, maxLength) + '...'
    : this.summary;
};

Analysis.prototype.getWordCount = function() {
  return this.summary.split(/\s+/).filter(word => word.length > 0).length;
};

module.exports = Analysis;