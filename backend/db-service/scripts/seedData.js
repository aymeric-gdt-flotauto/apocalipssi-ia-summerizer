require('dotenv').config();
const { sequelize, testConnection } = require('../config/database');
const { Analysis } = require('../models');

// Données de démonstration d'analyses (ce que le service IA vous enverrait)
const demoAnalyses = [
  {
    documentName: 'Rapport_Financier_Q4_2023.pdf',
    documentId: 'ext_doc_001',
    summary: "Rapport financier détaillé du quatrième trimestre 2023 montrant une croissance de 15% du chiffre d'affaires et une amélioration significative de la marge opérationnelle. Les investissements R&D ont été augmentés pour préparer l'avenir.",
    keyPoints: [
      "Chiffre d'affaires en hausse de 15% par rapport à Q4 2022",
      "Marge opérationnelle améliorée de 3,2 points",
      "Réduction des coûts opérationnels de 8%",
      "Investissements R&D augmentés de 20%"
    ],
    actionItems: [
      {
        id: '1',
        title: 'Optimiser la stratégie commerciale',
        description: 'Capitaliser sur la croissance pour étendre la part de marché',
        priority: 'high',
        category: 'Stratégie'
      },
      {
        id: '2',
        title: 'Analyser ROI des investissements R&D',
        description: 'Évaluer l\'impact des investissements supplémentaires en R&D',
        priority: 'medium',
        category: 'Finance'
      }
    ],
    confidence: 94,
    processingTime: 3.8,
    modelUsed: 'gpt-4-turbo',
    tokensUsed: 1250,
    category: 'Financier',
    tags: ['Q4', 'finance', 'croissance', 'R&D']
  },
  {
    documentName: 'Contrat_Partenariat_TechCorp.pdf', 
    documentId: 'ext_doc_002',
    summary: "Contrat de partenariat stratégique avec TechCorp définissant les modalités de collaboration technologique et les conditions financières sur 3 ans. Investissement initial de 2,5M€ avec partage des revenus 60/40.",
    keyPoints: [
      "Durée du contrat: 3 ans renouvelable",
      "Investissement initial: 2,5M€",
      "Partage des revenus: 60/40",
      "Clause d'exclusivité territoriale Europe de l'Ouest",
      "Collaboration technologique définie en annexe"
    ],
    actionItems: [
      {
        id: '1',
        title: 'Validation juridique',
        description: 'Faire réviser les clauses par le département juridique',
        priority: 'high',
        category: 'Juridique'
      },
      {
        id: '2',
        title: 'Planification financière',
        description: 'Budgéter l\'investissement initial de 2,5M€',
        priority: 'high',
        category: 'Finance'
      }
    ],
    confidence: 88,
    processingTime: 5.2,
    modelUsed: 'gpt-4',
    tokensUsed: 980,
    category: 'Juridique',
    tags: ['contrat', 'partenariat', 'TechCorp', '3ans']
  },
  {
    documentName: 'Apocal_Enoncé_Etudiants.pdf',
    documentId: 'ext_doc_003', 
    summary: "Énoncé du projet Apocalipsi - Assistant intelligent de synthèse de documents. POC à développer en 4 jours avec méthodologie Scrum, utilisant Node.js, React et intégration API LLM. Gestion d'incidents quotidiens simulés.",
    keyPoints: [
      "POC assistant intelligent de synthèse de documents",
      "Méthodologie Scrum sur 4 jours",
      "Stack technique: Node.js, React, API LLM",
      "Gestion de 2 incidents quotidiens simulés",
      "Usage d'outils de génération de code IA",
      "Livraison d'un prototype fonctionnel"
    ],
    actionItems: [
      {
        id: '1',
        title: 'Définir l\'architecture technique',
        description: 'Valider les choix technologiques avec l\'équipe',
        priority: 'high',
        category: 'Architecture'
      },
      {
        id: '2',
        title: 'Organiser les sprints',
        description: 'Planifier les 4 jours de développement en sprints',
        priority: 'high',
        category: 'Gestion projet'
      },
      {
        id: '3',
        title: 'Configurer les outils IA',
        description: 'Intégrer Cursor, GitHub Copilot, Bolt, etc.',
        priority: 'medium',
        category: 'Outils'
      }
    ],
    confidence: 95,
    processingTime: 4.2,
    modelUsed: 'gpt-4-turbo',
    tokensUsed: 1580,
    category: 'Projet',
    tags: ['POC', 'Scrum', '4jours', 'IA', 'Node.js', 'React']
  }
];

// Fonction pour créer les données de démo
const seedDemoData = async () => {
  try {
    console.log('🌱 Initialisation des données de démonstration...\n');
    console.log('📋 Type: Analyses JSON uniquement (pas de documents)');

    // Vider la table analyses
    await Analysis.destroy({ where: {} });
    console.log('🗑️  Table analyses vidée');

    // Créer les analyses de démo
    for (const [index, analysisData] of demoAnalyses.entries()) {
      const analysis = await Analysis.create(analysisData);
      console.log(`🔍 Analyse ${index + 1} créée: "${analysis.documentName}" (ID: ${analysis.id})`);
    }

    console.log('\n✅ Données de démonstration créées avec succès !');
    console.log('\n📊 Résumé:');
    console.log(`   • ${demoAnalyses.length} analyses créées`);
    console.log('   • Catégories: Financier, Juridique, Projet');
    console.log('   • Confiance moyenne: 92%');
    
    console.log('\n🚀 Vous pouvez maintenant tester l\'API !');
    console.log('\n📋 Tests recommandés:');
    console.log('   • GET http://localhost:3000/api/analyses');
    console.log('   • GET http://localhost:3000/api/analyses/stats');
    console.log('   • GET http://localhost:3000/api/analyses/search?q=POC');
    console.log('   • GET http://localhost:3000/api/analyses?category=Financier');
    
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
      // Statistiques par catégorie
      const byCategory = await Analysis.findAll({
        attributes: [
          'category',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
          [require('sequelize').fn('AVG', require('sequelize').col('confidence')), 'avgConfidence']
        ],
        group: ['category'],
        raw: true
      });
      
      console.log('\n📈 Par catégorie:');
      byCategory.forEach(stat => {
        const avgConf = Math.round(stat.avgConfidence || 0);
        console.log(`   • ${stat.category || 'Autres'}: ${stat.count} analyses (confiance moy: ${avgConf}%)`);
      });
      
      // Dernières analyses
      const recent = await Analysis.findAll({
        attributes: ['id', 'documentName', 'confidence', 'category', 'createdAt'],
        limit: 5,
        order: [['createdAt', 'DESC']]
      });
      
      console.log('\n📋 Dernières analyses:');
      recent.forEach(analysis => {
        console.log(`   • ${analysis.documentName} (${analysis.category}) - ${analysis.confidence}%`);
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
📖 Script de données de démonstration (Analyses seulement)

Usage:
  node scripts/seedData.js [options]

Options:
  --show, -s    Afficher les données existantes
  --help, -h    Afficher cette aide

Sans option: Créer les données de démonstration

Données créées:
  • 3 analyses de démonstration
  • Catégories: Financier, Juridique, Projet  
  • Format: JSON complet avec résumé, points clés, actions
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