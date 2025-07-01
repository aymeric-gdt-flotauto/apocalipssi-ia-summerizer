const express = require('express');

// Import des routes (seulement analyses)
const analysisRoutes = require('./analyses');

const router = express.Router();

// Route de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Stockage Analyses fonctionnelle',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Montage des routes (seulement analyses)
router.use('/analyses', analysisRoutes);

// Route par défaut pour /api
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Stockage d\'Analyses IA',
    description: 'Service de stockage pur pour analyses de documents générées par IA',
    version: '1.0.0',
    endpoints: {
      analyses: '/api/analyses',
      health: '/api/health'
    },
    documentation: {
      storeAnalysis: 'POST /api/analyses (stocker une analyse)',
      listAnalyses: 'GET /api/analyses (lister toutes)',
      getAnalysis: 'GET /api/analyses/:id (récupérer une)',
      updateAnalysis: 'PUT /api/analyses/:id (modifier une)',
      deleteAnalysis: 'DELETE /api/analyses/:id (supprimer une)',
      searchAnalyses: 'GET /api/analyses/search?q=terme (rechercher)',
      stats: 'GET /api/analyses/stats (statistiques)'
    },
    usage: {
      role: 'Stockage pur d\'analyses JSON provenant d\'un service IA externe',
      input: 'Analyses JSON du service IA',
      output: 'Analyses stockées vers le frontend'
    }
  });
});

module.exports = router;