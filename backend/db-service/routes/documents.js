const express = require('express');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const {
  uploadDocument,
  getAllDocuments,
  getDocument,
  getDocumentText,
  deleteDocument,
  getStats
} = require('../controllers/documentController');
const { 
  uploadSingle, 
  handleUploadError, 
  validateFilePresence, 
  cleanupOnError 
} = require('../middleware/upload');
const { validate, validateParams, schemas } = require('../middleware/validation');

const router = express.Router();

// Limite de taux pour l'upload de documents
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads par IP par 15 minutes
  message: {
    success: false,
    message: 'Limite d\'upload atteinte, veuillez réessayer dans 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @route   POST /api/documents/upload
 * @desc    Upload d'un document PDF
 * @access  Public
 */
router.post('/upload',
  uploadLimiter,
  cleanupOnError,
  uploadSingle,
  handleUploadError,
  validateFilePresence,
  uploadDocument
);

/**
 * @route   GET /api/documents
 * @desc    Obtenir la liste de tous les documents
 * @access  Public
 */
router.get('/',
  validate(schemas.pagination, 'query'),
  getAllDocuments
);

/**
 * @route   GET /api/documents/stats
 * @desc    Obtenir les statistiques des documents
 * @access  Public
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/documents/:id
 * @desc    Obtenir les détails d'un document
 * @access  Public
 */
router.get('/:id',
  validateParams(Joi.object({
    id: Joi.string().required()
  })),
  getDocument
);

/**
 * @route   GET /api/documents/:id/text
 * @desc    Obtenir le texte complet d'un document
 * @access  Public
 */
router.get('/:id/text',
  validateParams(Joi.object({
    id: Joi.string().required()
  })),
  getDocumentText
);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Supprimer un document
 * @access  Public
 */
router.delete('/:id',
  validateParams(Joi.object({
    id: Joi.string().required()
  })),
  deleteDocument
);

module.exports = router;