const fs = require('fs');

// Middleware de gestion d'erreurs global
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur serveur interne';

  // Log de l'erreur (sauf pour les erreurs client)
  if (statusCode >= 500) {
    console.error('🔥 Erreur serveur:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // Gestion spécifique des erreurs Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Données invalides';
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));
    
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Cette ressource existe déjà';
    const field = err.errors[0]?.path || 'unknown';
    
    return res.status(statusCode).json({
      success: false,
      message: `${field} déjà utilisé`
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Référence invalide';
    
    return res.status(statusCode).json({
      success: false,
      message
    });
  }

  // Erreurs de limite de taux
  if (err.statusCode === 429) {
    message = 'Trop de requêtes, veuillez réessayer plus tard';
  }

  // Nettoyer les fichiers uploadés en cas d'erreur
  if (req.file && req.file.path) {
    fs.unlink(req.file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Erreur suppression fichier:', unlinkErr);
      }
    });
  }

  // Réponse d'erreur standardisée
  const errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { 
      stack: err.stack 
    })
  };

  res.status(statusCode).json(errorResponse);
};

// Middleware pour gérer les routes non trouvées
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} non trouvée`
  });
};

// Wrapper pour les fonctions async
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Classe d'erreur personnalisée
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError
};