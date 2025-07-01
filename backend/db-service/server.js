const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import des modules locaux
const { testConnection, syncDatabase } = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configuration CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression des réponses
app.use(compression());

// Limite de taux globale
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requêtes par IP par 15 minutes
  message: {
    success: false,
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(globalLimiter);

// Parsing des données
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Middleware de logging en développement
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Routes principales
app.use('/api', routes);

// Route racine
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Document Analysis v1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      api: '/api',
      health: '/api/health',
      documents: '/api/documents',
      analyses: '/api/analyses',
      upload: '/api/documents/upload'
    },
    usage: {
      upload: 'POST /api/documents/upload (avec form-data, champ "document")',
      listDocs: 'GET /api/documents',
      getDoc: 'GET /api/documents/:id',
      analyze: 'POST /api/analyses/documents/:documentId',
      getAnalysis: 'GET /api/analyses/:id'
    }
  });
});

// Gestion des erreurs 404
app.use(notFoundHandler);

// Gestionnaire d'erreurs global
app.use(errorHandler);

// Initialisation du serveur
const startServer = async () => {
  try {
    console.log('🚀 Démarrage du serveur Document Analysis API...\n');
    
    // Test de connexion à la base de données
    await testConnection();
    
    // Synchronisation des modèles (en développement)
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase(false); // false = ne pas réinitialiser les données
    }
    
    // Démarrage du serveur
    const server = app.listen(PORT, () => {
      console.log(`
🎉 Serveur démarré avec succès !
📍 Environnement: ${process.env.NODE_ENV || 'development'}
🌐 URL: http://localhost:${PORT}
📋 API: http://localhost:${PORT}/api
❤️  Health: http://localhost:${PORT}/api/health

📄 Documentation rapide:
   • Upload PDF: POST ${PORT}/api/documents/upload
   • Liste docs: GET ${PORT}/api/documents  
   • Analyser: POST ${PORT}/api/analyses/documents/:id
   • Voir analyse: GET ${PORT}/api/analyses/:id

🔧 Prêt à analyser vos documents !
      `);
    });

    // Gestion de l'arrêt propre
    const gracefulShutdown = (signal) => {
      console.log(`\n📡 Signal ${signal} reçu, arrêt en cours...`);
      
      server.close((err) => {
        if (err) {
          console.error('❌ Erreur lors de l\'arrêt du serveur:', err);
          process.exit(1);
        }
        
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
      });
    };

    // Écoute des signaux d'arrêt
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Gestion des erreurs non capturées
    process.on('uncaughtException', (error) => {
      console.error('💥 Exception non capturée:', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Promesse rejetée non gérée:', reason);
      console.error('À:', promise);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error.message);
    process.exit(1);
  }
};

// Démarrer le serveur
if (require.main === module) {
  startServer();
}

module.exports = app;