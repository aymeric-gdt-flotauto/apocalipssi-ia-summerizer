# 📊 DB Service - Stockage d'Analyses IA

Service de stockage pur pour analyses de documents générées par IA. Reçoit du JSON d'analyses et les stocke en base de données.

## 🚀 Installation rapide

### Prérequis
- **Node.js** 18+
- **MariaDB/MySQL** en fonctionnement
- **Base de données** `document_analysis` créée

### 1. Configuration

```bash
# Copier le fichier d'environnement
cp "exemple de.env" .env

# Éditer les paramètres de base de données
# DB_HOST=localhost
# DB_USER=votre_utilisateur
# DB_PASSWORD=votre_mot_de_passe
```

### 2. Installation

```bash
npm install
```

### 3. Migration de la base

```bash
node scripts/migrate.js
# Répondre 'y' pour créer la structure
```

### 4. Données de test (optionnel)

```bash
node scripts/seedData.js
```

## 🎯 Utilisation

### Démarrer le serveur

```bash
npm start
# Serveur sur http://localhost:3000
```

### API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/health` | Status du service |
| `GET` | `/api/analyses` | Liste toutes les analyses |
| `POST` | `/api/analyses` | Stocker une nouvelle analyse |
| `GET` | `/api/analyses/:id` | Récupérer une analyse |
| `PUT` | `/api/analyses/:id` | Modifier une analyse |
| `DELETE` | `/api/analyses/:id` | Supprimer une analyse |
| `GET` | `/api/analyses/search` | Rechercher des analyses |
| `GET` | `/api/analyses/stats` | Statistiques |

## 🧪 Tests rapides

```bash
# Status de l'API
curl http://localhost:3000/api/health

# Lister les analyses
curl http://localhost:3000/api/analyses

# Statistiques
curl http://localhost:3000/api/analyses/stats
```

## 📝 Format d'une analyse

```json
{
  "documentName": "Mon_Document.pdf",
  "documentId": "doc_123",
  "summary": "Résumé du document...",
  "keyPoints": ["Point 1", "Point 2"],
  "actionItems": [
    {
      "title": "Action à faire",
      "description": "Description détaillée",
      "priority": "high",
      "category": "Urgent"
    }
  ],
  "confidence": 95,
  "processingTime": 3.2,
  "modelUsed": "gpt-4",
  "tokensUsed": 1200,
  "category": "Financier",
  "tags": ["finance", "rapport"]
}
```

## 🛠️ Scripts utiles

```bash
# Voir les données existantes
node scripts/seedData.js --show

# Info sur la base de données
node scripts/migrate.js --info

# Tests automatisés
chmod +x test-api.sh && ./test-api.sh
```

## 📋 Structure du projet

```
db-service/
├── config/          # Configuration DB
├── models/          # Modèle Sequelize (Analysis)
├── controllers/     # Logique métier
├── routes/          # Routes Express
├── middleware/      # Validation, erreurs
├── scripts/         # Migration & seed
└── server.js        # Point d'entrée
```

## ⚡ Usage typique

1. **Service IA** analyse un document
2. **Service IA** envoie le JSON d'analyse via `POST /api/analyses`
3. **Frontend** récupère les analyses via `GET /api/analyses`
4. **Utilisateur** consulte/recherche les analyses

---

**🎯 Objectif :** Stockage pur et simple d'analyses JSON provenant d'un service IA externe.