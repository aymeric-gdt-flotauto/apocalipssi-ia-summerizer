const mysql = require('mysql2/promise');

const waitForDatabase = async () => {
  const maxRetries = 30; // 30 tentatives
  const retryInterval = 2000; // 2 secondes entre chaque tentative
  
  const dbConfig = {
    host: process.env.DB_HOST || 'database-mysql',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || '',
  };

  console.log('🔄 Attente de la disponibilité de MySQL...');
  console.log(`📍 Connexion à: ${dbConfig.host}:${dbConfig.port}`);

  for (let i = 1; i <= maxRetries; i++) {
    try {
      const connection = await mysql.createConnection(dbConfig);
      await connection.ping();
      await connection.end();
      
      console.log('✅ MySQL est prêt !');
      return true;
    } catch (error) {
      console.log(`⏳ Tentative ${i}/${maxRetries} - MySQL pas encore prêt...`);
      
      if (i === maxRetries) {
        console.error('❌ Impossible de se connecter à MySQL après', maxRetries, 'tentatives');
        console.error('Erreur:', error.message);
        process.exit(1);
      }
      
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }
};

if (require.main === module) {
  waitForDatabase();
}

module.exports = waitForDatabase; 