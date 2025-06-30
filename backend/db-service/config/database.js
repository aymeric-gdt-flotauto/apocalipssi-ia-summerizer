const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('🔧 Chargement de la configuration de base de données...');

// Configuration de la connexion MariaDB/MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'document_analysis',
  process.env.DB_USER || 'root', 
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql', // Compatible avec MariaDB
    dialectOptions: {
      charset: 'utf8mb4'
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '+01:00',
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

// Test de connexion avec gestion d'erreurs détaillée
const testConnection = async () => {
  try {
    console.log('🔍 Test de connexion à la base de données...');
    console.log(`📍 Tentative de connexion à: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès');
    
    // Test simple de requête
    const [results] = await sequelize.query('SELECT 1 as test');
    console.log('✅ Requête de test réussie');
    
    return true;
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.parent?.code || 'Inconnu'}`);
    
    // Messages d'aide spécifiques
    if (error.parent?.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Solution: Vérifiez le nom d\'utilisateur et mot de passe dans .env');
      console.error(`   DB_USER=${process.env.DB_USER}`);
      console.error(`   DB_PASSWORD=${process.env.DB_PASSWORD ? '***' : 'VIDE'}`);
    } else if (error.parent?.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Solution: La base de données n\'existe pas');
      console.error(`   Créez la base: CREATE DATABASE ${process.env.DB_NAME};`);
    } else if (error.parent?.code === 'ECONNREFUSED') {
      console.error('💡 Solution: MariaDB/MySQL n\'est pas démarré');
      console.error('   Démarrez le service de base de données');
    } else if (error.parent?.code === 'ENOTFOUND') {
      console.error('💡 Solution: Host incorrect');
      console.error(`   Vérifiez DB_HOST=${process.env.DB_HOST}`);
    }
    
    throw error;
  }
};

// Synchronisation des modèles
const syncDatabase = async (force = false) => {
  try {
    console.log(`🔄 Synchronisation de la base de données (force: ${force})...`);
    await sequelize.sync({ force });
    console.log(`✅ Base de données synchronisée ${force ? '(RESET)' : ''}`);
  } catch (error) {
    console.error('❌ Erreur synchronisation DB:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};