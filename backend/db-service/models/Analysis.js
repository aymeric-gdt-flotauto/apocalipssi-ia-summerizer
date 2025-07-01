const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Analysis = sequelize.define('Analysis', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => Math.random().toString(36).substr(2, 9)
  },
 
  documentName: {
    type: DataTypes.STRING(255),
    allowNull: false 
  },
  documentId: {
    type: DataTypes.STRING(255),
    allowNull: true 
  },

  summary: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  keyPoints: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  actionItems: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  confidence: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  processingTime: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  // Métadonnées de l'IA
  modelUsed: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'unknown'
  },
  tokensUsed: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  // Catégorie/type de document
  category: {
    type: DataTypes.STRING(100),
    allowNull: true 
  },

  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'analyses',
  timestamps: true,
  indexes: [
    {
      fields: ['confidence']
    },
    {
      fields: ['category']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['document_name']
    }
  ]
});


Analysis.prototype.getFormattedKeyPoints = function() {
  return this.keyPoints?.map((point, index) => `${index + 1}. ${point}`).join('\n') || '';
};

Analysis.prototype.getHighPriorityActions = function() {
  return this.actionItems?.filter(action => action.priority === 'high') || [];
};

Analysis.prototype.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags = [...this.tags, tag];
    return this.save();
  }
};

module.exports = Analysis;