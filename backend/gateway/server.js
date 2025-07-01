import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 3001;

const dbServiceUrl = process.env.DB_SERVICE_URL || 'http://db-service:3000';
const iaServiceUrl = process.env.IA_SERVICE_URL || 'http://ia-service:5000';

// Proxy pour /db-service/*
app.use('/db-service', createProxyMiddleware({
  target: dbServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/db-service': '',
  },
}));

// Proxy pour /ia-service/*
app.use('/ia-service', createProxyMiddleware({
  target: iaServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/ia-service': '',
  },
}));

// Route racine
app.get('/', (req, res) => {
  res.send('Gateway opérationnelle. Utilisez /db-service ou /ia-service.');
});

app.listen(PORT, () => {
  console.log(`Gateway en écoute sur le port ${PORT}`);
}); 