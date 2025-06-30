const express = require('express');

// Import des routes
const documentRoutes = require('./documents');
const analysisRoutes = require('./analyses');

const router = express.Router();

// Route de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Document Analysis fonctionnelle',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Montage des routes
router.use('/documents', documentRoutes);
router.use('/analyses', analysisRoutes);

// Route par défaut pour /api
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur l\'API Document Analysis',
    version: '1.0.0',
    endpoints: {
      documents: '/api/documents',
      analyses: '/api/analyses',
      health: '/api/health'
    },
    documentation: {
      upload: 'POST /api/documents/upload',
      listDocuments: 'GET /api/documents',
      getDocument: 'GET /api/documents/:id',
      createAnalysis: 'POST /api/analyses/documents/:documentId',
      getAnalysis: 'GET /api/analyses/:id'
    }
  });
});

module.exports = router;