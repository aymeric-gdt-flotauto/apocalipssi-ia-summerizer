require('dotenv').config();
const { sequelize, testConnection } = require('../config/database');
const { Analysis } = require('../models');

// Données de démonstration d'analyses simplifiées
const demoAnalyses = [
  {
    summary: "Rapport financier détaillé du quatrième trimestre 2023 montrant une croissance de 15% du chiffre d'affaires et une amélioration significative de la marge opérationnelle. Les investissements R&D ont été augmentés pour préparer l'avenir. L'entreprise a réussi à réduire ses coûts opérationnels de 8% tout en maintenant la qualité des services. Les perspectives pour 2024 sont encourageantes avec de nouveaux marchés à explorer."
  },
  {
    summary: "Contrat de partenariat stratégique avec TechCorp définissant les modalités de collaboration technologique et les conditions financières sur 3 ans. Investissement initial de 2,5M€ avec partage des revenus 60/40. Le contrat inclut une clause d'exclusivité territoriale pour l'Europe de l'Ouest et des modalités de collaboration technique précises. Les objectifs de croissance sont ambitieux mais réalisables selon l'analyse de marché."
  },
  {
    summary: "Énoncé du projet Apocalipsi - Assistant intelligent de synthèse de documents. POC à développer en 4 jours avec méthodologie Scrum, utilisant Node.js, React et intégration API LLM. Le projet implique la gestion de 2 incidents quotidiens simulés et l'usage d'outils de génération de code IA. L'objectif est de livrer un prototype fonctionnel démontrant les capacités d'analyse automatique de documents PDF."
  },
  {
    summary: "Analyse de marché pour le lancement d'un nouveau produit dans le secteur des technologies vertes. L'étude révèle un potentiel de croissance de 200% sur les 5 prochaines années. Les concurrents principaux sont identifiés et leurs stratégies analysées. Les barrières à l'entrée sont modérées et les opportunités de partenariats nombreuses. Le budget prévisionnel est de 5M€ pour la première phase."
  },
  {
    summary: "Rapport d'audit interne sur les processus de sécurité informatique. Identification de 12 vulnérabilités critiques et 28 points d'amélioration. Les recommandations incluent la mise à jour des systèmes, la formation du personnel et l'implémentation de nouvelles procédures. Le coût estimé des améliorations est de 300K€ sur 18 mois avec un ROI attendu de 150% grâce à la réduction des risques."
  }
];

// Fonction pour créer les données de démo
const seedDemoData = async () => {
  try {
    console.log('🌱 Initialisation des données de démonstration...\n');
    console.log('📋 Type: Analyses simplifiées (summary uniquement)');

    // Vider la table analyses
    await Analysis.destroy({ where: {} });
    console.log('🗑️  Table analyses vidée');

    // Créer les analyses de démo
    for (const [index, analysisData] of demoAnalyses.entries()) {
      const analysis = await Analysis.create(analysisData);
      const wordCount = analysis.getWordCount();
      console.log(`🔍 Analyse ${index + 1} créée: ${wordCount} mots (ID: ${analysis.id})`);
    }

    console.log('\n✅ Données de démonstration créées avec succès !');
    console.log('\n📊 Résumé:');
    console.log(`   • ${demoAnalyses.length} analyses créées`);
    console.log('   • Format: Summary text uniquement');
    console.log('   • Calculs automatiques: nombre de mots, résumé court');
    
    console.log('\n🚀 Vous pouvez maintenant tester l\'API !');
    console.log('\n📋 Tests recommandés:');
    console.log('   • GET http://localhost:3000/api/analyses');
    console.log('   • GET http://localhost:3000/api/analyses/stats');
    console.log('   • GET http://localhost:3000/api/analyses/search?q=POC');
    console.log('   • GET http://localhost:3000/api/analyses/search?min_words=50');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la création des données de démo:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

// Fonction pour afficher les données existantes
const showExistingData = async () => {
  try {
    await testConnection();
    
    const analysisCount = await Analysis.count();
    console.log('\n📊 Données existantes:');
    console.log(`   • Analyses: ${analysisCount}`);
    
    if (analysisCount > 0) {
      // Récupérer quelques analyses pour les statistiques
      const analyses = await Analysis.findAll({
        attributes: ['id', 'summary', 'createdAt'],
        limit: 5,
        order: [['createdAt', 'DESC']]
      });
      
      console.log('\n📈 Statistiques:');
      const wordCounts = analyses.map(a => a.summary.split(/\s+/).length);
      const avgWords = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length);
      console.log(`   • Nombre moyen de mots: ${avgWords}`);
      console.log(`   • Plus long: ${Math.max(...wordCounts)} mots`);
      console.log(`   • Plus court: ${Math.min(...wordCounts)} mots`);
      
      console.log('\n📋 Dernières analyses:');
      analyses.forEach(analysis => {
        const shortSummary = analysis.summary.substring(0, 60) + '...';
        const wordCount = analysis.summary.split(/\s+/).length;
        console.log(`   • ${shortSummary} (${wordCount} mots)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

// Fonction principale
const run = async () => {
  try {
    await testConnection();
    
    const args = process.argv.slice(2);
    
    if (args.includes('--show') || args.includes('-s')) {
      await showExistingData();
    } else if (args.includes('--help') || args.includes('-h')) {
      console.log(`
📖 Script de données de démonstration (Version simplifiée)

Usage:
  node scripts/seedData.js [options]

Options:
  --show, -s    Afficher les données existantes
  --help, -h    Afficher cette aide

Sans option: Créer les données de démonstration

Données créées:
  • ${demoAnalyses.length} analyses de démonstration
  • Format: Summary text uniquement
  • Métadonnées calculées: nombre de mots, résumé court
      `);
    } else {
      await seedDemoData();
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Exécuter si appelé directement
if (require.main === module) {
  run();
}

module.exports = {
  seedDemoData,
  demoAnalyses
};