const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Analysis = sequelize.define('Analysis', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => Math.random().toString(36).substr(2, 9)
  },
  documentId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'documents',
      key: 'id'
    }
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  keyPoints: {
    type: DataTypes.JSON, // Array de strings
    allowNull: false,
    defaultValue: []
  },
  actionItems: {
    type: DataTypes.JSON, // Array d'objets avec id, title, description, priority, category
    allowNull: false,
    defaultValue: []
  },
  confidence: {
    type: DataTypes.INTEGER, // Pourcentage 0-100
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  processingTime: {
    type: DataTypes.DECIMAL(5, 2), // Temps en secondes avec 2 décimales
    allowNull: false
  },
  modelUsed: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'gpt-4-turbo-preview'
  },
  tokensUsed: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'analyses',
  timestamps: true,
  indexes: [
  {
    fields: ['document_id']  
  },
  {
    fields: ['confidence']
  },
  {
    fields: ['created_at']  
  }
]
});

// Méthodes d'instance
Analysis.prototype.addActionItem = function(title, description, priority = 'medium', category = 'General') {
  const newActionItem = {
    id: Math.random().toString(36).substr(2, 9),
    title,
    description,
    priority,
    category
  };
  
  this.actionItems = [...this.actionItems, newActionItem];
  return this.save();
};

Analysis.prototype.getFormattedKeyPoints = function() {
  return this.keyPoints?.map((point, index) => `${index + 1}. ${point}`).join('\n') || '';
};

Analysis.prototype.getHighPriorityActions = function() {
  return this.actionItems?.filter(action => action.priority === 'high') || [];
};

module.exports = Analysis;