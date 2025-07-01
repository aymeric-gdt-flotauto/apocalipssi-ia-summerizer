# IA Service - Analyseur de Documents Intelligent 🤖

## Vue d'ensemble

Le **IA Service** est un microservice Python utilisant Flask qui fournit des capacités d'analyse intelligente de documents PDF. Il utilise des modèles d'intelligence artificielle avancés (Qwen 3:14B) pour extraire des insights, générer des résumés et identifier des éléments d'action à partir de documents.

## Architecture

```
Frontend → Gateway → IA Service (Port 5000) → Modèle IA (Qwen 3:14B)
                                           ↓
                              DB Service (Stockage des analyses)
```

## Fonctionnalités principales

🔍 **Extraction de texte PDF** - Extraction automatique du contenu textuel  
🧠 **Analyse intelligente** - Utilisation de modèles d'IA avancés  
📊 **Génération de résumés** - Résumés détaillés et points clés  
✅ **Éléments d'action** - Identification automatique des tâches et actions  
💾 **Persistance** - Sauvegarde automatique des analyses  
🏥 **Health Check** - Monitoring de la santé du service  
🌐 **CORS** - Compatible avec les applications web frontend  

## Endpoints API

### `POST /api/analyze`
Analyse un document PDF et retourne les insights générés.

**Paramètres :**
- `file` (multipart/form-data) : Fichier PDF à analyser

**Réponse :**
```json
{
  "summary": "Résumé détaillé du document",
  "keyPoints": [
    "Point clé 1",
    "Point clé 2", 
    "Point clé 3"
  ],
  "actionItems": [
    {
      "id": "action-1",
      "title": "Titre de l'action",
      "description": "Description détaillée",
      "priority": "high|medium|low",
      "category": "Catégorie"
    }
  ],
  "confidence": 85,
  "processingTime": 12.3,
  "documentName": "document.pdf"
}
```

**Exemple d'utilisation :**
```bash
curl -X POST http://localhost:5000/api/analyze \
  -F "file=@document.pdf"
```

### `GET /api/health`
Vérification de l'état du service et de la connectivité au modèle IA.

**Réponse :**
```json
{
  "status": "healthy|degraded|unhealthy",
  "model_service": "connected|unreachable|error",
  "model": "ai/qwen3:14B-Q6_K",
  "service_url": "http://model-runner.docker.internal:12434"
}
```

## Installation et démarrage

### Prérequis
- Python 3.11+
- pip ou poetry
- Service de modèle IA accessible (Qwen 3:14B)

### Installation locale
```bash
# Installation des dépendances
pip install -r requirements.txt

# Configuration des variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Démarrage du service
python app.py
```

### Avec Docker
```bash
# Construction de l'image
docker build -t ia-service .

# Lancement du container
docker run -p 5000:5000 \
  -e MODEL_SERVICE_URL=http://your-model-service \
  -e MODEL_NAME=ai/qwen3:14B-Q6_K \
  ia-service
```

### Avec Docker Compose
```bash
# Depuis la racine du projet
docker-compose up ia-service
```

## Configuration

### Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `PORT` | Port d'écoute du service | `5000` |
| `MODEL_SERVICE_URL` | URL du service de modèle IA | `http://model-runner.docker.internal` |
| `MODEL_NAME` | Nom du modèle à utiliser | `ai/qwen3:14B-Q6_K` |
| `DB_SERVICE_URL` | URL du service de base de données | `http://db-service:3000` |

### Exemple de fichier .env
```env
PORT=5000
MODEL_SERVICE_URL=http://model-runner.docker.internal:12434
MODEL_NAME=ai/qwen3:14B-Q6_K
DB_SERVICE_URL=http://db-service:3000
```

## Développement

### Structure du projet
```
ia-service/
├── app.py              # Application Flask principale
├── requirements.txt    # Dépendances Python
├── Dockerfile         # Configuration Docker
├── .env.example       # Exemple de configuration
├── .gitignore        # Fichiers à ignorer
└── README.md         # Documentation
```

### Dépendances principales
- **Flask** : Framework web Python
- **Flask-CORS** : Support CORS pour les requêtes cross-origin
- **PyPDF2** : Extraction de texte depuis les PDF
- **requests** : Client HTTP pour les appels aux services externes
- **python-dotenv** : Gestion des variables d'environnement

### Architecture du code

#### `extract_text_from_pdf(pdf_file)`
Extrait le texte d'un fichier PDF en utilisant PyPDF2.

#### `analyze_with_model(text)`
- Prépare les prompts pour le modèle IA
- Communique avec le service de modèle via API OpenAI compatible
- Nettoie et valide la réponse JSON
- Gère les erreurs et timeouts

#### `create_error_response(error_message, start_time)`
Génère une réponse d'erreur standardisée.

### Ajout de nouveaux formats de fichiers

Pour supporter d'autres formats (DOCX, TXT, etc.) :

1. Ajouter la dépendance appropriée dans `requirements.txt`
2. Créer une fonction d'extraction spécifique :

```python
def extract_text_from_docx(docx_file):
    # Logique d'extraction DOCX
    pass

def extract_text_from_file(file):
    if file.filename.endswith('.pdf'):
        return extract_text_from_pdf(file.read())
    elif file.filename.endswith('.docx'):
        return extract_text_from_docx(file.read())
    # etc.
```

3. Mettre à jour la validation dans `/api/analyze`

## Modèles d'IA supportés

Le service est compatible avec tout modèle utilisant l'API OpenAI. Modèles testés :

- **Qwen 3:14B-Q6_K** (recommandé) - Modèle principal utilisé
- **GPT-3.5/4** - Via API OpenAI officielle
- **Llama 2/3** - Via services compatibles OpenAI

### Configuration de modèle personnalisé
```env
MODEL_SERVICE_URL=http://your-ollama-instance:11434
MODEL_NAME=llama3:8b
```

## Monitoring et débogage

### Vérification du statut
```bash
# Vérifier la santé du service
curl http://localhost:5000/api/health

# Réponse attendue pour un service sain :
{
  "status": "healthy",
  "model_service": "connected",
  "model": "ai/qwen3:14B-Q6_K",
  "service_url": "http://model-runner.docker.internal:12434"
}
```

### Logs et debugging
Les logs sont affichés dans la console avec les informations suivantes :
- Configuration au démarrage
- Tentatives de connexion au modèle
- Erreurs de traitement
- Temps de réponse

### Métriques de performance
- **Temps d'extraction PDF** : ~1-3 secondes
- **Temps d'analyse IA** : ~10-30 secondes (selon la taille du document)
- **Limite de texte** : 15,000 caractères (configurable)
- **Timeout API** : 120 secondes

## Sécurité

### Mesures implémentées
- **Validation des fichiers** : Seuls les PDF sont acceptés
- **Limitation de taille** : Contrôle de la taille des fichiers
- **Timeout des requêtes** : Prévention des blocages
- **Sanitisation JSON** : Nettoyage des réponses du modèle

### Améliorations recommandées
- Authentification et autorisation
- Rate limiting par IP/utilisateur
- Chiffrement des communications
- Audit des requêtes
- Antivirus sur les fichiers uploadés

## Dépannage

### Problèmes courants

**Service ne démarre pas**
```bash
# Vérifier les dépendances
pip install -r requirements.txt

# Vérifier le port
netstat -an | grep 5000
```

**Erreur de connexion au modèle IA**
```bash
# Vérifier la connectivité
curl http://model-runner.docker.internal:12434/engines/v1/models

# Vérifier les variables d'environnement
echo $MODEL_SERVICE_URL
```

**Erreur d'extraction PDF**
- Vérifier que le PDF n'est pas protégé par mot de passe
- Vérifier que le PDF contient du texte (pas seulement des images)
- Tester avec un PDF simple

**Timeout des requêtes**
- Réduire la taille du document
- Augmenter le timeout dans le code
- Vérifier les performances du serveur de modèle

### Codes d'erreur HTTP

| Code | Description |
|------|-------------|
| 200 | Analyse réussie |
| 400 | Fichier manquant ou format invalide |
| 500 | Erreur interne du serveur |
| 503 | Service de modèle IA indisponible |

## Performance et optimisation

### Recommandations production
- Utiliser **Gunicorn** comme serveur WSGI
- Configurer un **reverse proxy** (Nginx)
- Implémenter la **mise en cache** des résultats
- Ajouter un **load balancer** pour la haute disponibilité

### Configuration Gunicorn
```bash
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 180 app:app
```

## Licence

Ce projet fait partie du système Apocalipssi IA Summarizer.

---

Pour plus d'informations, consultez la documentation générale du projet dans le README principal.
