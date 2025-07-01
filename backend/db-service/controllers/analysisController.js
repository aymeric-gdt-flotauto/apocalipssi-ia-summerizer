const { Analysis } = require('../models');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// STOCKER une analyse (reçue du service IA)
const storeAnalysis = asyncHandler(async (req, res) => {
  const { 
    documentName, 
    documentId, 
    summary, 
    keyPoints, 
    actionItems, 
    confidence, 
    processingTime, 
    modelUsed, 
    tokensUsed,
    category,
    tags 
  } = req.body;

  // Créer l'analyse
  const analysis = await Analysis.create({
    documentName,
    documentId: documentId || null,
    summary,
    keyPoints,
    actionItems,
    confidence,
    processingTime: processingTime || 0,
    modelUsed: modelUsed || 'unknown',
    tokensUsed: tokensUsed || 0,
    category: category || null,
    tags: tags || []
  });

  console.log(`✅ Analyse stockée: ${analysis.id} pour "${documentName}"`);

  res.status(201).json({
    success: true,
    message: 'Analyse stockée avec succès',
    data: {
      id: analysis.id,
      documentName: analysis.documentName,
      summary: analysis.summary,
      keyPoints: analysis.keyPoints,
      actionItems: analysis.actionItems,
      confidence: analysis.confidence,
      processingTime: analysis.processingTime,
      category: analysis.category,
      tags: analysis.tags,
      createdAt: analysis.createdAt
    }
  });
});

// RÉCUPÉRER toutes les analyses
const getAllAnalyses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, search } = req.query;
  const offset = (page - 1) * limit;

  // Construire les conditions de recherche
  const whereConditions = {};
  
  if (category) {
    whereConditions.category = category;
  }
  
  if (search) {
    whereConditions[require('sequelize').Op.or] = [
      { documentName: { [require('sequelize').Op.like]: `%${search}%` } },
      { summary: { [require('sequelize').Op.like]: `%${search}%` } }
    ];
  }

  const { count, rows: analyses } = await Analysis.findAndCountAll({
    where: whereConditions,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['updatedAt'] } // Pas besoin de updatedAt
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    success: true,
    data: {
      analyses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
});

// RÉCUPÉRER une analyse spécifique
const getAnalysis = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const analysis = await Analysis.findByPk(id, {
    attributes: { exclude: ['updatedAt'] }
  });

  if (!analysis) {
    throw new AppError('Analyse non trouvée', 404);
  }

  res.json({
    success: true,
    data: analysis
  });
});

// METTRE À JOUR une analyse
const updateAnalysis = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const analysis = await Analysis.findByPk(id);

  if (!analysis) {
    throw new AppError('Analyse non trouvée', 404);
  }

  await analysis.update(updateData);

  console.log(`✅ Analyse mise à jour: ${id}`);

  res.json({
    success: true,
    message: 'Analyse mise à jour avec succès',
    data: analysis
  });
});

// SUPPRIMER une analyse
const deleteAnalysis = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const analysis = await Analysis.findByPk(id);

  if (!analysis) {
    throw new AppError('Analyse non trouvée', 404);
  }

  await analysis.destroy();

  console.log(`✅ Analyse supprimée: ${id}`);

  res.json({
    success: true,
    message: 'Analyse supprimée avec succès'
  });
});

// RECHERCHER des analyses
const searchAnalyses = asyncHandler(async (req, res) => {
  const { q, category, confidence_min, confidence_max } = req.query;

  const whereConditions = {};

  // Recherche textuelle
  if (q) {
    whereConditions[require('sequelize').Op.or] = [
      { documentName: { [require('sequelize').Op.like]: `%${q}%` } },
      { summary: { [require('sequelize').Op.like]: `%${q}%` } },
      { category: { [require('sequelize').Op.like]: `%${q}%` } }
    ];
  }

  // Filtres
  if (category) {
    whereConditions.category = category;
  }

  if (confidence_min) {
    whereConditions.confidence = { 
      [require('sequelize').Op.gte]: parseInt(confidence_min) 
    };
  }

  if (confidence_max) {
    if (whereConditions.confidence) {
      whereConditions.confidence[require('sequelize').Op.lte] = parseInt(confidence_max);
    } else {
      whereConditions.confidence = { 
        [require('sequelize').Op.lte]: parseInt(confidence_max) 
      };
    }
  }

  const analyses = await Analysis.findAll({
    where: whereConditions,
    order: [['confidence', 'DESC'], ['createdAt', 'DESC']],
    limit: 50 // Limite pour la recherche
  });

  res.json({
    success: true,
    data: {
      analyses,
      total: analyses.length
    }
  });
});

// STATISTIQUES des analyses
const getStats = asyncHandler(async (req, res) => {
  const totalAnalyses = await Analysis.count();
  
  const avgConfidence = await Analysis.findOne({
    attributes: [
      [require('sequelize').fn('AVG', require('sequelize').col('confidence')), 'avgConfidence']
    ],
    raw: true
  });

  const byCategory = await Analysis.findAll({
    attributes: [
      'category',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
    ],
    group: ['category'],
    raw: true
  });

  const recentAnalyses = await Analysis.count({
    where: {
      createdAt: {
        [require('sequelize').Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  });

  res.json({
    success: true,
    data: {
      totalAnalyses,
      averageConfidence: Math.round(avgConfidence.avgConfidence || 0),
      analysesByCategory: byCategory,
      recentAnalyses: recentAnalyses
    }
  });
});

module.exports = {
  storeAnalysis,      // ✅ POST /analyses
  getAllAnalyses,     // ✅ GET /analyses  
  getAnalysis,        // ✅ GET /analyses/:id
  updateAnalysis,     // ✅ PUT /analyses/:id
  deleteAnalysis,     // ✅ DELETE /analyses/:id
  searchAnalyses,     // ✅ GET /analyses/search
  getStats           // ✅ GET /analyses/stats
};