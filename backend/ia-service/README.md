# Service IA - Analyse de Documents avec l'API Gemini

Ce service fournit des capacités d'analyse de documents en utilisant l'API Gemini de Google pour générer des réponses structurées.

## Fonctionnalités

- Traitement de documents PDF
- Extraction et analyse de texte
- Génération de réponses structurées avec l'API Gemini
- Points de terminaison API pour l'analyse de documents

## Installation

### 1. Créer un environnement virtuel

```bash
# Créer l'environnement virtuel
python -m venv .venv

# Activer l'environnement virtuel
# Sur Windows :
.venv\Scripts\activate

# Sur macOS/Linux :
source .venv/bin/activate
```

### 2. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 3. Configuration des variables d'environnement

Copiez le fichier `.env.example` vers `.env` et mettez à jour les valeurs :

```bash
cp .env.example .env
```

Puis éditez le fichier `.env` et ajoutez votre clé API Gemini :

```
GEMINI_API_KEY=votre_cle_api_gemini_ici
PORT=5000
```

Vous pouvez obtenir une clé API Gemini depuis [Google AI Studio](https://makersuite.google.com/app/apikey).

## Démarrage du Service

Pour exécuter le service localement :

```bash
python app.py
```

Le service sera disponible sur `http://localhost:5000`.

## Test du Service

Un script de test est fourni pour vérifier que le service fonctionne correctement :

```bash
python test_api.py [chemin_vers_pdf]
```

Si vous ne fournissez pas de chemin vers un fichier PDF, le script essaiera d'en trouver un dans le répertoire courant ou parent.

Le script enverra le PDF à l'API et affichera les résultats de l'analyse.

## Points de Terminaison API

### Analyser un Document

**Point de terminaison :** `POST /api/analyze`

**Requête :**
- Content-Type: `multipart/form-data`
- Corps : 
  - `file`: Fichier PDF à analyser

**Réponse :**
```json
{
  "summary": "Un résumé complet du document",
  "keyPoints": [
    "Point clé 1",
    "Point clé 2",
    "..."
  ],
  "actionItems": [
    {
      "id": "1",
      "title": "Titre de l'action",
      "description": "Description détaillée de l'action",
      "priority": "high",
      "category": "Catégorie"
    },
    "..."
  ],
  "confidence": 92,
  "processingTime": 4.2
}
```

### Vérification de Santé

**Point de terminaison :** `GET /api/health`

**Réponse :**
```json
{
  "status": "healthy"
}
```

## Gestion des Erreurs

L'API retourne des codes de statut HTTP appropriés et des messages d'erreur :

- 400: Requête Incorrecte (ex: aucun fichier fourni, type de fichier non supporté)
- 500: Erreur Interne du Serveur (avec détails de l'erreur)

## Intégration avec le Frontend

Ce service est conçu pour fonctionner avec le frontend DocuMind AI. Le format de réponse correspond à la structure attendue définie dans les types du frontend.


## Dépannage

### Problèmes courants

1. **Erreur de clé API** : Vérifiez que votre clé API Gemini est correctement configurée dans le fichier `.env`

2. **Erreur de dépendances** : Assurez-vous que l'environnement virtuel est activé avant d'installer les dépendances

3. **Port déjà utilisé** : Si le port 5000 est déjà utilisé, modifiez la variable `PORT` dans le fichier `.env`

### Activation de l'environnement virtuel

N'oubliez pas d'activer l'environnement virtuel à chaque fois que vous travaillez sur le projet :

```bash
# Sur Windows :
.venv\Scripts\activate

# Sur macOS/Linux :
source .venv/bin/activate
```

Pour désactiver l'environnement virtuel :

```bash
deactivate
```