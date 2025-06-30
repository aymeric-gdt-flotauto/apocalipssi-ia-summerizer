const Document = require('./Document');
const Analysis = require('./Analysis');

// Définition des associations
Document.hasOne(Analysis, {
  foreignKey: 'documentId',
  as: 'analysisResult',
  onDelete: 'CASCADE'
});

Analysis.belongsTo(Document, {
  foreignKey: 'documentId',
  as: 'document'
});

module.exports = {
  Document,
  Analysis
};