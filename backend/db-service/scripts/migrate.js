const readline = require('readline');
require('dotenv').config();

const { sequelize, testConnection, syncDatabase } = require('../config/database');

// Interface pour les questions
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour poser une question
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

// Fonction principale de migration
const runMigration = async () => {
  // Détecter l'environnement Docker ou non-interactif
  const isDockerOrNonInteractive = process.env.NODE_ENV === 'production' || 
                                 process.env.DOCKER === 'true' || 
                                 !process.stdin.isTTY;
  
  try {
    console.log('🔄 Début de la migration de la base de données...\n');

    // Test de connexion
    console.log('1️⃣  Test de connexion à MySQL...');
    await testConnection();

    console.log('\n2️⃣  Synchronisation des modèles...');
    console.log('📋 Structure: Table analyses uniquement (stockage pur)');
    
    let forceSync = false;
    
    if (isDockerOrNonInteractive) {
      // En mode Docker/non-interactif, utiliser des valeurs par défaut
      console.log('🐳 Mode Docker détecté - migration automatique sans réinitialisation');
      forceSync = false; // Ne pas réinitialiser en production/Docker
    } else {
      // Mode interactif normal
      const shouldReset = await askQuestion(
        '⚠️  Voulez-vous réinitialiser la base de données ? (y/N): '
      );
      
      forceSync = shouldReset.toLowerCase() === 'y' || shouldReset.toLowerCase() === 'yes';
      
      if (forceSync) {
        console.log('🗑️  ATTENTION: Toutes les données existantes seront supprimées !');
        const confirm = await askQuestion('Confirmer ? (y/N): ');
        
        if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
          console.log('❌ Migration annulée');
          process.exit(0);
        }
      }
    }

    // Synchronisation
    await syncDatabase(forceSync);
    
    console.log('\n✅ Migration terminée avec succès !');
    console.log('\n📋 Résumé:');
    console.log('   • Base de données synchronisée');
    console.log('   • Table analyses créée/mise à jour');
    console.log('   • Structure: Stockage pur d\'analyses JSON');
    
    console.log('\n🚀 Vous pouvez maintenant:');
    console.log('   • Démarrer le serveur: npm run start');
    console.log('   • Ajouter des données de test: npm run seed');
    console.log('   • Tester l\'API: curl http://localhost:3000/api/analyses');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    // Fermer readline seulement s'il est utilisé
    if (!isDockerOrNonInteractive) {
      rl.close();
    }
    await sequelize.close();
  }
};

// Fonction pour afficher les informations de la base
const showDatabaseInfo = async () => {
  try {
    await testConnection();
    
    const tableNames = await sequelize.getQueryInterface().showAllTables();
    console.log('\n📊 Tables existantes:', tableNames);
    
    if (tableNames.includes('analyses')) {
      const { Analysis } = require('../models');
      const analysisCount = await Analysis.count();
      console.log(`🔍 Analyses: ${analysisCount}`);
      
      // Afficher quelques exemples
      if (analysisCount > 0) {
        const samples = await Analysis.findAll({
          attributes: ['id', 'documentName', 'confidence', 'createdAt'],
          limit: 3,
          order: [['createdAt', 'DESC']]
        });
        
        console.log('\n📋 Dernières analyses:');
        samples.forEach(analysis => {
          console.log(`   • ${analysis.documentName} (${analysis.confidence}%) - ${analysis.createdAt}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
};

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--info') || args.includes('-i')) {
  showDatabaseInfo();
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📖 Script de migration de la base de données (Analyses seulement)

Usage:
  node scripts/migrate.js [options]

Options:
  --info, -i    Afficher les informations de la base de données
  --help, -h    Afficher cette aide

Sans option: Lance la migration interactive

Structure:
  • Table 'analyses' uniquement
  • Stockage pur d'analyses JSON provenant du service IA
  • Pas de documents, pas d'upload, juste du JSON
  `);
} else {
  runMigration();
}