const Joi = require('joi');

// Schémas de validation
const schemas = {
  // Validation pour les paramètres de pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'status').default('createdAt'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
    status: Joi.string().valid('processing', 'completed', 'error').optional()
  })
};

// Middleware générique de validation
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = source === 'query' ? req.query : req.body;
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Retourner toutes les erreurs
      stripUnknown: true // Supprimer les champs non définis
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors
      });
    }

    // Remplacer les données par les valeurs validées
    if (source === 'query') {
      req.query = value;
    } else {
      req.body = value;
    }

    next();
  };
};

// Middleware pour valider les paramètres d'URL
const validateParams = (paramSchema) => {
  return (req, res, next) => {
    const { error, value } = paramSchema.validate(req.params);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides',
        errors: error.details.map(detail => detail.message)
      });
    }

    req.params = value;
    next();
  };
};

module.exports = {
  validate,
  validateParams,
  schemas
};