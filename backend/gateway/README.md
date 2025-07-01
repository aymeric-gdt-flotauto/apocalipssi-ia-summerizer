# Gateway - Routeur de Services 🚀

## Vue d'ensemble

La **Gateway** est un reverse proxy qui centralise l'accès aux services backend de l'application Apocalipssi IA Summarizer. Elle agit comme un point d'entrée unique pour router les requêtes vers les services appropriés.

## Architecture

```
Frontend (React) → Gateway (Port 3001) → Services Backend
                                      ├── DB Service (Port 3000)
                                      └── IA Service (Port 5000)
```

## Fonctionnalités

- **Reverse Proxy** : Route les requêtes vers les services backend appropriés
- **Routage intelligent** : Redirection basée sur les préfixes d'URL
- **Configuration flexible** : Variables d'environnement pour les URLs des services
- **Monitoring** : Endpoint de santé pour vérifier le statut

## Routes disponibles

| Route | Destination | Description |
|-------|-------------|-------------|
| `GET /` | Gateway | Page d'accueil avec informations de routage |
| `/db-service/*` | DB Service (3000) | Toutes les opérations de base de données |
| `/ia-service/*` | IA Service (5000) | Toutes les opérations d'intelligence artificielle |

### Exemples d'utilisation

```bash
# Vérifier le statut de la gateway
curl http://localhost:3001/

# Accéder au service de base de données
curl http://localhost:3001/db-service/analyses

# Accéder au service d'IA
curl http://localhost:3001/ia-service/analyze
```

## Installation et démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation locale
```bash
# Installation des dépendances
npm install

# Démarrage du service
npm start
```

### Avec Docker
```bash
# Construction de l'image
docker build -t gateway .

# Lancement du container
docker run -p 3001:3001 gateway
```

### Avec Docker Compose
```bash
# Depuis la racine du projet
docker-compose up gateway
```

## Configuration

### Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `PORT` | Port d'écoute de la gateway | `3001` |
| `DB_SERVICE_URL` | URL du service de base de données | `http://db-service:3000` |
| `IA_SERVICE_URL` | URL du service d'IA | `http://ia-service:5000` |

### Exemple de fichier .env
```env
PORT=3001
DB_SERVICE_URL=http://localhost:3000
IA_SERVICE_URL=http://localhost:5000
```

## Développement

### Structure du projet
```
gateway/
├── server.js          # Serveur principal
├── package.json       # Dépendances et scripts
├── Dockerfile         # Configuration Docker
└── README.md         # Documentation
```

### Dépendances principales
- **Express.js** : Framework web Node.js
- **http-proxy-middleware** : Middleware de reverse proxy

### Ajout d'un nouveau service
Pour ajouter un nouveau service backend :

1. Définir l'URL du service dans les variables d'environnement
2. Ajouter le proxy middleware dans `server.js` :

```javascript
app.use('/nouveau-service', createProxyMiddleware({
  target: process.env.NOUVEAU_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/nouveau-service': '',
  },
}));
```

## Monitoring et débogage

### Vérification du statut
```bash
# Vérifier que la gateway répond
curl http://localhost:3001/

# Réponse attendue :
# "Gateway opérationnelle. Utilisez /db-service ou /ia-service."
```

### Logs
Les logs sont affichés dans la console :
```bash
Gateway en écoute sur le port 3001
```

### Debugging
Pour activer les logs détaillés du proxy :
```javascript
// Dans server.js, ajouter l'option logLevel
app.use('/db-service', createProxyMiddleware({
  target: dbServiceUrl,
  changeOrigin: true,
  logLevel: 'debug',
  pathRewrite: {
    '^/db-service': '',
  },
}));
```

## Sécurité

### Bonnes pratiques implémentées
- **changeOrigin: true** : Modifie l'en-tête Host pour éviter les problèmes CORS
- **pathRewrite** : Nettoie les préfixes avant de transmettre aux services

### Améliorations possibles
- Authentification et autorisation
- Rate limiting
- Validation des requêtes
- HTTPS/TLS
- Logging avancé

## Dépannage

### Problèmes courants

**La gateway ne démarre pas**
- Vérifier que le port 3001 n'est pas utilisé
- Vérifier les variables d'environnement

**Erreur 502 Bad Gateway**
- Vérifier que les services backend sont démarrés
- Vérifier les URLs des services dans les variables d'environnement

**Timeout des requêtes**
- Vérifier la connectivité réseau entre les services
- Augmenter le timeout du proxy si nécessaire

## Licence

Ce projet fait partie du système Apocalipssi IA Summarizer.

---

Pour plus d'informations, consultez la documentation générale du projet dans le README principal. 