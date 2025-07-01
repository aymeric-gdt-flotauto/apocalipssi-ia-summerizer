# Apocalipssi IA Summarizer 🚀

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

**Apocalipssi IA Summarizer** est une application d'analyse intelligente de documents qui traite les fichiers PDF et génère des insights structurés en utilisant des modèles d'IA avancés. Le système offre une interface moderne pour extraire automatiquement des résumés, points clés et éléments d'action à partir de vos documents.

## 🎯 Vue d'ensemble

DocuMind AI révolutionne l'analyse documentaire en fournissant :

- **📄 Résumés intelligents** : Synthèses concises et structurées
- **🔍 Points clés** : Extraction automatique des informations importantes  
- **✅ Éléments d'action** : Identification des tâches et recommandations
- **📚 Historique complet** : Gestion et recherche des analyses précédentes
- **🎨 Interface moderne** : Design responsive et intuitive

## 🏗️ Architecture du système

Le projet suit une **architecture microservices** pour la scalabilité et la maintenabilité :

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│                 │    │              │    │                 │
│   Frontend      │───▶│   Gateway    │───▶│   IA Service    │
│   (React/Vite)  │    │   (Proxy)    │    │   (Python)      │
│   Port: 5173    │    │   Port: 3001 │    │   Port: 5000    │
│                 │    │              │    │                 │
└─────────────────┘    └──────┬───────┘    └─────────┬───────┘
                              │                      │
                              ▼                      ▼
                       ┌──────────────┐    ┌─────────────────┐
                       │              │    │                 │
                       │  DB Service  │    │   Modèle IA     │
                       │  (Node.js)   │    │   (Qwen 3:14B)  │
                       │  Port: 3000  │    │   Port: 12434   │
                       │              │    │                 │
                       └──────┬───────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │              │
                       │   MySQL      │
                       │  Database    │
                       │  Port: 3306  │
                       │              │
                       └──────────────┘
```

### 🧩 Composants du système

| Service | Description | Technologies | Port |
|---------|-------------|--------------|------|
| **[Frontend](./frontend/README.md)** | Interface utilisateur moderne | React 18, TypeScript, Vite, Tailwind CSS | 5173 |
| **[Gateway](./backend/gateway/README.md)** | Reverse proxy et routeur | Node.js, Express, http-proxy-middleware | 3001 |
| **[IA Service](./backend/ia-service/README.md)** | Analyse intelligente de documents | Python, Flask, PyPDF2, Qwen 3:14B | 5000 |
| **[DB Service](./backend/db-service/README.md)** | Gestion des données | Node.js, Express, MySQL | 3000 |
| **Database** | Stockage persistant | MySQL 8.0 | 3306 |

## 🚀 Démarrage rapide

### Prérequis

- **Docker** & **Docker Compose** (recommandé)
- **Node.js 18+** & **npm** (pour le développement local)
- **Python 3.11+** (pour le développement local)
- **Modèle IA** accessible (Qwen 3:14B ou compatible OpenAI)

### 🐳 Installation avec Docker (Recommandée)

1. **Cloner le repository**
```bash
git clone https://github.com/aymeric-gdt-flotauto/apocalipssi-ia-summerizer.git
cd apocalipssi-ia-summerizer
```

2. **Configurer les variables d'environnement**
```bash
cp example.env .env
# Éditer .env avec vos configurations
```

3. **Démarrer tous les services**
```bash
docker-compose up -d
```

4. **Vérifier le déploiement**
```bash
# Vérifier les services
docker-compose ps

# Vérifier les logs
docker-compose logs -f
```

5. **Accéder à l'application**
- **Interface web** : http://localhost:5173
- **API Gateway** : http://localhost:3001

### 💻 Installation locale

<details>
<summary>Cliquer pour voir les instructions détaillées</summary>

#### 1. Base de données
```bash
# Démarrer MySQL avec Docker
docker run --name mysql-db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=document_analysis -p 3306:3306 -d mysql:latest
```

#### 2. DB Service
```bash
cd backend/db-service
npm install
cp exemple\ de\ copy.env .env
# Configurer les variables DB dans .env
npm start
```

#### 3. IA Service
```bash
cd backend/ia-service
pip install -r requirements.txt
cp .env.example .env
# Configurer MODEL_SERVICE_URL dans .env
python app.py
```

#### 4. Gateway
```bash
cd backend/gateway
npm install
npm start
```

#### 5. Frontend
```bash
cd frontend
npm install
npm run dev
```

</details>

## ⚙️ Configuration

### Variables d'environnement principales

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `MYSQL_DATABASE` | Nom de la base de données | `document_analysis` |
| `MYSQL_USER` | Utilisateur MySQL | `identifiant` |
| `MYSQL_PASSWORD` | Mot de passe MySQL | `motdepasse` |
| `IA_SERVICE_MODEL_SERVICE_URL` | URL du modèle IA | `http://model-runner.docker.internal:12434` |
| `IA_SERVICE_MODEL_NAME` | Nom du modèle | `ai/qwen3:14B-Q6_K` |
| `CORS_ORIGIN` | Origine CORS autorisée | `*` |

### Fichier .env complet
```env
# Base de données
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=document_analysis
MYSQL_USER=identifiant
MYSQL_PASSWORD=motdepasse

# Services
DB_SERVICE_PORT=3000
IA_SERVICE_PORT=5000
GATEWAY_PORT=3001

# IA Configuration
IA_SERVICE_MODEL_SERVICE_URL=http://model-runner.docker.internal:12434
IA_SERVICE_MODEL_NAME=ai/qwen3:14B-Q6_K

# Réseau
CORS_ORIGIN=*
DB_SERVICE_URL=http://db-service:3000
IA_SERVICE_URL=http://ia-service:5000
```

## 📊 Utilisation

### Interface web

1. **Accéder à l'application** : http://localhost:5173
2. **Upload d'un document** : Glisser-déposer un fichier PDF
3. **Analyse automatique** : Le système traite le document
4. **Résultats structurés** : Visualiser le résumé, points clés et actions
5. **Historique** : Consulter les analyses précédentes

### API REST

#### Analyser un document
```bash
curl -X POST http://localhost:3001/ia-service/api/analyze \
  -F "file=@document.pdf"
```

#### Récupérer l'historique
```bash
curl http://localhost:3001/db-service/api/analyses
```

#### Health check
```bash
curl http://localhost:3001/ia-service/api/health
```

## 🛠️ Développement

### Structure du projet
```
apocalipssi-ia-summerizer/
├── frontend/                    # Interface React
│   ├── src/
│   │   ├── components/         # Composants UI
│   │   ├── services/          # Services API
│   │   └── types/             # Types TypeScript
│   └── README.md
├── backend/
│   ├── gateway/               # Reverse proxy
│   ├── ia-service/           # Service d'analyse IA
│   └── db-service/           # Service de base de données
├── docker-compose.yml         # Orchestration Docker
├── example.env               # Variables d'environnement
└── README.md                 # Documentation principale
```

### Scripts de développement

```bash
# Démarrage en mode développement
docker-compose -f docker-compose.dev.yml up

# Rebuild d'un service spécifique
docker-compose build frontend

# Logs d'un service
docker-compose logs -f ia-service

# Tests
npm test                      # Frontend
python -m pytest            # IA Service
npm run test                 # DB Service
```

### Ajout d'un nouveau service

1. Créer le dossier du service
2. Ajouter le Dockerfile
3. Mettre à jour docker-compose.yml
4. Configurer les variables d'environnement
5. Documenter dans un README spécifique

## 🧪 Tests et qualité

### Tests automatisés
```bash
# Frontend (Vitest)
cd frontend && npm run test

# Backend Python (pytest)
cd backend/ia-service && python -m pytest

# Backend Node.js (Jest)
cd backend/db-service && npm test
```

### Linting et formatage
```bash
# Frontend
npm run lint

# Python
flake8 backend/ia-service/
black backend/ia-service/

# Node.js
eslint backend/*/
```

## 🚀 Déploiement

### Production avec Docker

```bash
# Build des images
docker-compose build

# Déploiement
docker-compose -f docker-compose.prod.yml up -d

# Monitoring
docker-compose logs -f
```

### Variables d'environnement production

```env
NODE_ENV=production
MYSQL_ROOT_PASSWORD=secure_password_here
CORS_ORIGIN=https://your-domain.com
```

### Reverse proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
    }
}
```

## 📈 Monitoring et maintenance

### Health checks
```bash
# Vérifier tous les services
curl http://localhost:3001/
curl http://localhost:3001/ia-service/api/health
curl http://localhost:3001/db-service/api/health
```

### Logs
```bash
# Logs agrégés
docker-compose logs -f

# Logs par service
docker-compose logs ia-service
docker-compose logs db-service
```

### Métriques
- **Temps de traitement IA** : ~10-30 secondes
- **Formats supportés** : PDF uniquement
- **Taille max fichier** : 50MB
- **Concurrent users** : Dépend de la configuration

## 🔧 Dépannage

### Problèmes courants

<details>
<summary><strong>Services ne démarrent pas</strong></summary>

```bash
# Vérifier les ports
netstat -an | grep -E "(3000|3001|5000|5173|3306)"

# Nettoyer et redémarrer
docker-compose down
docker-compose up --build
```
</details>

<details>
<summary><strong>Erreur de connexion à la base de données</strong></summary>

```bash
# Vérifier MySQL
docker-compose logs database-mysql

# Tester la connexion
docker-compose exec database-mysql mysql -u identifiant -p document_analysis
```
</details>

<details>
<summary><strong>Modèle IA inaccessible</strong></summary>

```bash
# Vérifier la connectivité
curl http://model-runner.docker.internal:12434/engines/v1/models

# Vérifier les variables d'environnement
docker-compose exec ia-service env | grep MODEL
```
</details>

### Support et debugging

1. **Consulter les logs** : `docker-compose logs -f [service]`
2. **Vérifier les variables** : `docker-compose config`
3. **Redémarrer un service** : `docker-compose restart [service]`
4. **Accès au container** : `docker-compose exec [service] bash`

## 📚 Documentation détaillée

- **[Frontend README](./frontend/README.md)** - Interface React et composants
- **[Gateway README](./backend/gateway/README.md)** - Reverse proxy et routage
- **[IA Service README](./backend/ia-service/README.md)** - Analyse intelligente
- **[DB Service README](./backend/db-service/README.md)** - Gestion des données

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de code

- **Frontend** : ESLint + Prettier + TypeScript strict
- **Backend Python** : Black + Flake8 + Type hints
- **Backend Node.js** : ESLint + StandardJS

## 👥 Équipe

- **Architecture** : Conception microservices et Docker
- **Frontend** : React 18 + TypeScript + Tailwind CSS
- **Backend** : Node.js + Python + Flask
- **IA/ML** : Intégration Qwen 3:14B et modèles compatibles
- **DevOps** : Docker + Docker Compose + CI/CD

---

<div align="center">
  <strong>🚀 Apocalipssi IA Summarizer - Transformez vos documents en insights intelligents</strong>
</div>
