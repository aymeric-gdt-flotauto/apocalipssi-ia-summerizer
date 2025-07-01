const express = require('express');
const Joi = require('joi');
const {
  storeAnalysis,
  getAllAnalyses,
  getAnalysis,
  updateAnalysis,
  deleteAnalysis,
  searchAnalyses,
  getStats
} = require('../controllers/analysisController');
const { validate, validateParams } = require('../middleware/validation');

const router = express.Router();

// Schéma de validation simplifié pour stocker/modifier une analyse
const analysisSchema = Joi.object({
  summary: Joi.string().required().min(10).max(10000).messages({
    'string.min': 'Le résumé doit faire au moins 10 caractères',
    'string.max': 'Le résumé ne peut pas dépasser 10000 caractères',
    'any.required': 'Le résumé est requis'
  })
});

/**
 * @route   GET /api/analyses/stats
 * @desc    Obtenir les statistiques des analyses
 * @access  Public
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/analyses/search
 * @desc    Rechercher des analyses
 * @access  Public
 */
router.get('/search', searchAnalyses);

/**
 * @route   POST /api/analyses
 * @desc    STOCKER une nouvelle analyse (depuis le service IA)
 * @access  Public
 */
router.post('/',
  validate(analysisSchema),
  storeAnalysis
);

/**
 * @route   GET /api/analyses
 * @desc    RÉCUPÉRER toutes les analyses avec pagination et filtres
 * @access  Public
 */
router.get('/',
  getAllAnalyses
);

/**
 * @route   GET /api/analyses/:id
 * @desc    RÉCUPÉRER une analyse spécifique
 * @access  Public
 */
router.get('/:id',
  validateParams(Joi.object({
    id: Joi.string().required()
  })),
  getAnalysis
);

/**
 * @route   PUT /api/analyses/:id
 * @desc    METTRE À JOUR une analyse
 * @access  Public
 */
router.put('/:id',
  validateParams(Joi.object({
    id: Joi.string().required()
  })),
  validate(analysisSchema),
  updateAnalysis
);

/**
 * @route   DELETE /api/analyses/:id
 * @desc    SUPPRIMER une analyse
 * @access  Public
 */
router.delete('/:id',
  validateParams(Joi.object({
    id: Joi.string().required()
  })),
  deleteAnalysis
);

module.exports = router;