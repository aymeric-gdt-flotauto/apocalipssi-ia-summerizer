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

// Schéma de validation pour stocker/modifier une analyse
const analysisSchema = Joi.object({
  documentName: Joi.string().required().min(3).max(255).messages({
    'string.min': 'Le nom du document doit faire au moins 3 caractères',
    'any.required': 'Le nom du document est requis'
  }),
  documentId: Joi.string().optional().allow(null),
  summary: Joi.string().required().min(10).max(5000).messages({
    'string.min': 'Le résumé doit faire au moins 10 caractères',
    'any.required': 'Le résumé est requis'
  }),
  keyPoints: Joi.array().items(Joi.string().min(3).max(500)).required().min(1).max(20).messages({
    'array.min': 'Au moins 1 point clé requis',
    'any.required': 'Les points clés sont requis'
  }),
  actionItems: Joi.array().items(
    Joi.object({
      id: Joi.string().optional(),
      title: Joi.string().required().min(3).max(200),
      description: Joi.string().required().min(10).max(1000),
      priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
      category: Joi.string().required().min(2).max(100)
    })
  ).max(10).default([]),
  confidence: Joi.number().integer().min(0).max(100).required().messages({
    'number.min': 'La confiance doit être entre 0 et 100',
    'any.required': 'Le score de confiance est requis'
  }),
  processingTime: Joi.number().positive().max(300).default(0),
  modelUsed: Joi.string().max(100).default('unknown'),
  tokensUsed: Joi.number().integer().min(0).default(0),
  category: Joi.string().max(100).optional().allow(null),
  tags: Joi.array().items(Joi.string().max(50)).max(10).default([])
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