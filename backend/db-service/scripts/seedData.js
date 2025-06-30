require('dotenv').config();
const { sequelize, testConnection } = require('../config/database');
const { Document, Analysis } = require('../models');

// Données de démonstration basées sur vos mock data
const demoData = [
  {
    document: {
      id: '1',
      name: 'Rapport_Financier_Q4_2023.pdf',
      size: 2456789,
      type: 'application/pdf',
      status: 'completed',
      filePath: './uploads/demo_rapport_financier.pdf',
      extractedText: 'Rapport financier détaillé du quatrième trimestre 2023. Le chiffre d\'affaires a atteint 15.2 millions d\'euros, soit une progression de 15% par rapport à la même période de l\'année précédente. La marge opérationnelle s\'améliore significativement avec 3.2 points supplémentaires. Les coûts opérationnels ont été réduits de 8% grâce aux mesures d\'optimisation mises en place. Les investissements en R&D ont été augmentés de 20% pour préparer l\'avenir.',
      uploadedAt: new Date('2024-01-15T10:30:00')
    },
    analysis: {
      summary: "Rapport financier détaillé du quatrième trimestre 2023 montrant une croissance de 15% du chiffre d'affaires et une amélioration significative de la marge opérationnelle.",
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
        }
      ],
      confidence: 94,
      processingTime: 3.8
    }
  },
  {
    document: {
      id: '2',
      name: 'Contrat_Partenariat_TechCorp.pdf',
      size: 1234567,
      type: 'application/pdf',
      status: 'completed',
      filePath: './uploads/demo_contrat_partenariat.pdf',
      extractedText: 'Contrat de partenariat stratégique entre notre société et TechCorp pour une durée de 3 ans renouvelable. L\'investissement initial prévu est de 2,5 millions d\'euros. Le partage des revenus est établi selon une répartition 60/40. Une clause d\'exclusivité territoriale est incluse pour la zone Europe de l\'Ouest. Les modalités de collaboration technologique sont définies en annexe.',
      uploadedAt: new Date('2024-01-10T14:20:00')
    },
    analysis: {
      summary: "Contrat de partenariat stratégique avec TechCorp définissant les modalités de collaboration technologique et les conditions financières sur 3 ans.",
      keyPoints: [
        "Durée du contrat: 3 ans renouvelable",
        "Investissement initial: 2,5M€",
        "Partage des revenus: 60/40",
        "Clause d'exclusivité territoriale"
      ],
      actionItems: [
        {
          id: '1',
          title: 'Validation juridique',
          description: 'Faire réviser les clauses par le département juridique',
          priority: 'high',
          category: 'Juridique'
        }
      ],
      confidence: 88,
      processingTime: 5.2
    }
  }
];

// Fonction pour créer les données de démo
const seedDemoData = async () => {
  try {
    console.log('🌱 Initialisation des données de démonstration...\n');

    // Vider les tables existantes
    await Analysis.destroy({ where: {} });
    await Document.destroy({ where: {} });
    console.log('🗑️  Tables vidées');

    // Créer les documents et analyses
    for (const data of demoData) {
      // Créer le document
      const document = await Document.create({
        id: data.document.id,
        name: data.document.name,
        size: data.document.size,
        type: data.document.type,
        status: data.document.status,
        filePath: data.document.filePath,
        extractedText: data.document.extractedText,
        uploadedAt: data.document.uploadedAt
      });

      console.log(`📄 Document créé: ${document.name}`);

      // Créer l'analyse
      const analysis = await Analysis.create({
        documentId: document.id,
        summary: data.analysis.summary,
        keyPoints: data.analysis.keyPoints,
        actionItems: data.analysis.actionItems,
        confidence: data.analysis.confidence,
        processingTime: data.analysis.processingTime,
        modelUsed: 'gpt-4-demo'
      });

      console.log(`🔍 Analyse créée: ID ${analysis.id}`);
    }

    console.log('\n✅ Données de démonstration créées avec succès !');
    console.log('\n📊 Résumé:');
    console.log(`   • ${demoData.length} documents créés`);
    console.log(`   • ${demoData.length} analyses créées`);
    console.log('\n🚀 Vous pouvez maintenant tester l\'API !');
    console.log('\n📋 Tests recommandés:');
    console.log('   • GET http://localhost:3000/api/documents');
    console.log('   • GET http://localhost:3000/api/analyses');
    console.log('   • GET http://localhost:3000/api/documents/1');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la création des données de démo:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

// Fonction pour afficher les données existantes
const showExistingData = async () => {
  try {
    await testConnection();
    
    const documentCount = await Document.count();
    const analysisCount = await Analysis.count();
    
    console.log('\n📊 Données existantes:');
    console.log(`   • Documents: ${documentCount}`);
    console.log(`   • Analyses: ${analysisCount}`);
    
    if (documentCount > 0) {
      const documents = await Document.findAll({
        attributes: ['id', 'name', 'status', 'uploadedAt'],
        limit: 5
      });
      
      console.log('\n📄 Derniers documents:');
      documents.forEach(doc => {
        console.log(`   • ${doc.name} (${doc.status}) - ${doc.uploadedAt}`);
      });
    }
    
    if (analysisCount > 0) {
      const analyses = await Analysis.findAll({
        attributes: ['id', 'confidence', 'createdAt'],
        include: [{
          model: Document,
          as: 'document',
          attributes: ['name']
        }],
        limit: 5
      });
      
      console.log('\n🔍 Dernières analyses:');
      analyses.forEach(analysis => {
        console.log(`   • ${analysis.document.name} (${analysis.confidence}%) - ${analysis.createdAt}`);
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
📖 Script de données de démonstration

Usage:
  node scripts/seedData.js [options]

Options:
  --show, -s    Afficher les données existantes
  --help, -h    Afficher cette aide

Sans option: Créer les données de démonstration
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
  demoData
};