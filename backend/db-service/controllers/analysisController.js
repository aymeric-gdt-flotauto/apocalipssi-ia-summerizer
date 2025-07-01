const { Analysis } = require('../models');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// STOCKER une analyse (reçue du service IA)
const storeAnalysis = asyncHandler(async (req, res) => {
  const { summary } = req.body;

  // Créer l'analyse
  const analysis = await Analysis.create({
    summary
  });

  console.log(`✅ Analyse stockée: ${analysis.id}`);

  res.status(201).json({
    success: true,
    message: 'Analyse stockée avec succès',
    data: {
      id: analysis.id,
      summary: analysis.summary,
      wordCount: analysis.getWordCount(),
      createdAt: analysis.createdAt
    }
  });
});

// RÉCUPÉRER toutes les analyses
const getAllAnalyses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const offset = (page - 1) * limit;

  // Construire les conditions de recherche
  const whereConditions = {};
  
  if (search) {
    whereConditions.summary = { 
      [require('sequelize').Op.like]: `%${search}%` 
    };
  }

  const { count, rows: analyses } = await Analysis.findAndCountAll({
    where: whereConditions,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['updatedAt'] }
  });

  const totalPages = Math.ceil(count / limit);

  // Ajouter des métadonnées calculées
  const analysesWithMeta = analyses.map(analysis => ({
    id: analysis.id,
    summary: analysis.summary,
    shortSummary: analysis.getShortSummary(),
    wordCount: analysis.getWordCount(),
    createdAt: analysis.createdAt
  }));

  res.json({
    success: true,
    data: {
      analyses: analysesWithMeta,
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
    data: {
      id: analysis.id,
      summary: analysis.summary,
      wordCount: analysis.getWordCount(),
      createdAt: analysis.createdAt
    }
  });
});

// METTRE À JOUR une analyse
const updateAnalysis = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { summary } = req.body;

  const analysis = await Analysis.findByPk(id);

  if (!analysis) {
    throw new AppError('Analyse non trouvée', 404);
  }

  await analysis.update({ summary });

  console.log(`✅ Analyse mise à jour: ${id}`);

  res.json({
    success: true,
    message: 'Analyse mise à jour avec succès',
    data: {
      id: analysis.id,
      summary: analysis.summary,
      wordCount: analysis.getWordCount(),
      createdAt: analysis.createdAt
    }
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
  const { q, min_words, max_words } = req.query;

  const whereConditions = {};

  // Recherche textuelle
  if (q) {
    whereConditions.summary = { 
      [require('sequelize').Op.like]: `%${q}%` 
    };
  }

  let analyses = await Analysis.findAll({
    where: whereConditions,
    order: [['createdAt', 'DESC']],
    limit: 50 // Limite pour la recherche
  });

  // Filtrage par nombre de mots (post-requête car pas de champ en DB)
  if (min_words || max_words) {
    analyses = analyses.filter(analysis => {
      const wordCount = analysis.getWordCount();
      if (min_words && wordCount < parseInt(min_words)) return false;
      if (max_words && wordCount > parseInt(max_words)) return false;
      return true;
    });
  }

  // Ajouter métadonnées
  const analysesWithMeta = analyses.map(analysis => ({
    id: analysis.id,
    summary: analysis.summary,
    shortSummary: analysis.getShortSummary(),
    wordCount: analysis.getWordCount(),
    createdAt: analysis.createdAt
  }));

  res.json({
    success: true,
    data: {
      analyses: analysesWithMeta,
      total: analysesWithMeta.length
    }
  });
});

// STATISTIQUES des analyses
const getStats = asyncHandler(async (req, res) => {
  const totalAnalyses = await Analysis.count();
  
  // Statistiques calculées côté application
  const allAnalyses = await Analysis.findAll({
    attributes: ['summary', 'createdAt']
  });

  const wordCounts = allAnalyses.map(a => a.summary.split(/\s+/).length);
  const avgWords = wordCounts.length > 0 
    ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
    : 0;

  const maxWords = wordCounts.length > 0 ? Math.max(...wordCounts) : 0;
  const minWords = wordCounts.length > 0 ? Math.min(...wordCounts) : 0;

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
      averageWords: avgWords,
      maxWords,
      minWords,
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