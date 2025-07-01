# 📊 DB Service - Stockage d'Analyses IA

Service de stockage minimaliste pour analyses textuelles générées par IA. Stocke et gère des résumés de documents avec métadonnées calculées automatiquement.

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

# Statistiques (nombre total, mots moyens, etc.)
curl http://localhost:3000/api/analyses/stats

# Créer une nouvelle analyse
curl -X POST http://localhost:3000/api/analyses \
  -H "Content-Type: application/json" \
  -d '{"summary": "Ceci est un résumé de test pour valider l API REST"}'

# Rechercher par mot-clé
curl "http://localhost:3000/api/analyses/search?q=test"

# Filtrer par nombre de mots
curl "http://localhost:3000/api/analyses/search?min_words=20&max_words=100"
```

## 📝 Format d'une analyse

```json
{
  "summary": "Résumé complet du document analysé par l'IA. Peut contenir plusieurs paragraphes décrivant le contenu, les points importants, et les conclusions principales..."
}
```

**Réponse de l'API :**
```json
{
  "id": "abc123def",
  "summary": "Résumé du document...",
  "wordCount": 156,
  "shortSummary": "Résumé du document... (tronqué à 100 chars)",
  "createdAt": "2025-07-01T10:30:00Z"
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
2. **Service IA** envoie le résumé via `POST /api/analyses`
3. **Système** calcule automatiquement les métadonnées (nombre de mots, résumé court)
4. **Frontend** récupère les analyses via `GET /api/analyses`
5. **Utilisateur** consulte/recherche les analyses par mots-clés ou nombre de mots

---

**🎯 Objectif :** Stockage simple et efficace de résumés textuels avec fonctionnalités de recherche intégrées.