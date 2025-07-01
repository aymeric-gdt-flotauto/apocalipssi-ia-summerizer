const express = require('express');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const {
  createAnalysis,
  getAnalysis,
  getAllAnalyses,
  deleteAnalysis
} = require('../controllers/analysisController');
const { validateParams } = require('../middleware/validation');

const router = express.Router();

// Limite de taux pour la génération d'analyses
const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 analyses par IP par heure
  message: {
    success: false,
    message: 'Limite de génération d\'analyses atteinte, veuillez réessayer dans 1 heure'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @route   POST /api/analyses/documents/:documentId
 * @desc    Créer une analyse pour un document
 * @access  Public
 */
router.post('/documents/:documentId',
  analysisLimiter,
  validateParams(Joi.object({
    documentId: Joi.string().required()
  })),
  createAnalysis
);

/**
 * @route   GET /api/analyses
 * @desc    Obtenir la liste de toutes les analyses
 * @access  Public
 */
router.get('/',
  getAllAnalyses
);

/**
 * @route   GET /api/analyses/:id
 * @desc    Obtenir une analyse spécifique
 * @access  Public
 */
router.get('/:id',
  validateParams(Joi.object({
    id: Joi.string().required()
  })),
  getAnalysis
);

/**
 * @route   DELETE /api/analyses/:id
 * @desc    Supprimer une analyse
 * @access  Public
 */
router.delete('/:id',
  validateParams(Joi.object({
    id: Joi.string().required()
  })),
  deleteAnalysis
);

module.exports = router;