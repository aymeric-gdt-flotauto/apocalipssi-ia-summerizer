const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const { Document, Analysis } = require('../models');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// Upload d'un document
const uploadDocument = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) {
    throw new AppError('Aucun fichier fourni', 400);
  }

  try {
    // Créer l'entrée en base de données
    const document = await Document.create({
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      filePath: file.path,
      status: 'processing'
    });

    // Extraire le texte du PDF en arrière-plan
    extractTextFromPDF(document.id);

    res.status(201).json({
      success: true,
      message: 'Document uploadé avec succès',
      data: {
        id: document.id,
        document: {
          id: document.id,
          name: document.name,
          size: document.size,
          type: document.type,
          uploadedAt: document.uploadedAt,
          status: document.status
        }
      }
    });
  } catch (error) {
    // Supprimer le fichier en cas d'erreur
    try {
      await fs.unlink(file.path);
    } catch (unlinkError) {
      console.error('Erreur suppression fichier:', unlinkError);
    }
    throw error;
  }
});

// Fonction pour extraire le texte du PDF (asynchrone)
const extractTextFromPDF = async (documentId) => {
  try {
    const document = await Document.findByPk(documentId);
    if (!document) return;

    console.log(`📄 Extraction du texte pour le document ${documentId}...`);

    // Lire le fichier PDF
    const pdfBuffer = await fs.readFile(document.filePath);
    
    // Extraire le texte
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;

    // Mettre à jour le document avec le texte extrait
    await document.update({
      extractedText,
      status: 'completed'
    });

    console.log(`✅ Texte extrait pour le document ${documentId} (${extractedText.length} caractères)`);
  } catch (error) {
    console.error(`❌ Erreur extraction PDF ${documentId}:`, error);
    
    // Mettre à jour le statut d'erreur
    await Document.findByPk(documentId).then(doc => {
      if (doc) {
        doc.update({ status: 'error' });
      }
    });
  }
};

// Obtenir la liste des documents
const getAllDocuments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;
  
  // Construire les conditions de filtrage
  const whereConditions = {};
  if (status) {
    whereConditions.status = status;
  }

  // Obtenir les documents avec pagination
  const { count, rows: documents } = await Document.findAndCountAll({
    where: whereConditions,
    include: [
      {
        model: Analysis,
        as: 'analysisResult',
        required: false
      }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['uploadedAt', 'DESC']]
  });

  const totalPages = Math.ceil(count / limit);

  // Formatter les données pour correspondre à la structure mockée
  const formattedDocuments = documents.map(doc => ({
    id: doc.id,
    document: {
      id: doc.id,
      name: doc.name,
      size: doc.size,
      type: doc.type,
      uploadedAt: doc.uploadedAt,
      status: doc.status
    },
    analysisResult: doc.analysisResult,
    createdAt: doc.uploadedAt
  }));

  res.json({
    success: true,
    data: {
      documents: formattedDocuments,
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

// Obtenir les détails d'un document
const getDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const document = await Document.findByPk(id, {
    include: [
      {
        model: Analysis,
        as: 'analysisResult'
      }
    ]
  });

  if (!document) {
    throw new AppError('Document non trouvé', 404);
  }

  // Formatter selon la structure mockée
  const formattedDocument = {
    id: document.id,
    document: {
      id: document.id,
      name: document.name,
      size: document.size,
      type: document.type,
      uploadedAt: document.uploadedAt,
      status: document.status
    },
    analysisResult: document.analysisResult,
    createdAt: document.uploadedAt
  };

  res.json({
    success: true,
    data: formattedDocument
  });
});

// Obtenir le texte complet d'un document
const getDocumentText = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const document = await Document.findByPk(id, {
    attributes: ['id', 'name', 'extractedText', 'status']
  });

  if (!document) {
    throw new AppError('Document non trouvé', 404);
  }

  if (document.status !== 'completed') {
    throw new AppError('Le texte n\'est pas encore disponible', 400);
  }

  res.json({
    success: true,
    data: {
      id: document.id,
      name: document.name,
      extractedText: document.extractedText
    }
  });
});

// Supprimer un document
const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const document = await Document.findByPk(id);

  if (!document) {
    throw new AppError('Document non trouvé', 404);
  }

  try {
    // Supprimer le fichier physique
    await fs.unlink(document.filePath);
  } catch (error) {
    console.error('Erreur suppression fichier physique:', error);
  }

  // Supprimer de la base de données (cascade vers analyses)
  await document.destroy();

  res.json({
    success: true,
    message: 'Document supprimé avec succès'
  });
});

// Obtenir les statistiques
const getStats = asyncHandler(async (req, res) => {
  const totalDocuments = await Document.count();
  const completedDocuments = await Document.count({ where: { status: 'completed' } });
  const totalAnalyses = await Analysis.count();

  const stats = await Document.findAll({
    attributes: [
      'status',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
    ],
    group: ['status'],
    raw: true
  });

  res.json({
    success: true,
    data: {
      totalDocuments,
      completedDocuments,
      totalAnalyses,
      documentsByStatus: stats
    }
  });
});

module.exports = {
  uploadDocument,
  getAllDocuments,
  getDocument,
  getDocumentText,
  deleteDocument,
  getStats,
  extractTextFromPDF
};