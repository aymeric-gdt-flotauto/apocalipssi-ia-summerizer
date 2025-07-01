# Frontend - DocuMind AI Interface 🎨

## Vue d'ensemble

**DocuMind AI** est une interface utilisateur moderne et réactive construite avec React 18, TypeScript et Vite. Elle fournit une expérience utilisateur intuitive pour l'analyse intelligente de documents PDF, offrant des fonctionnalités avancées de visualisation des résultats et de gestion de l'historique.

## Architecture

```
Frontend (React + Vite) → Gateway (Port 3001) → Services Backend
                        ↓
            Interface utilisateur moderne
            ├── Upload de documents PDF
            ├── Analyse en temps réel
            ├── Résultats structurés
            └── Historique complet
```

## Fonctionnalités principales

🎯 **Interface intuitive** - Design moderne avec Tailwind CSS  
📁 **Upload drag & drop** - Zone de glisser-déposer pour les PDF  
🤖 **Analyse en temps réel** - Intégration avec l'IA service  
📊 **Résultats structurés** - Résumés, points clés et actions  
📚 **Historique complet** - Gestion des analyses précédentes  
🔍 **Recherche avancée** - Filtrage et recherche dans l'historique  
📱 **Design responsive** - Compatible mobile et desktop  
⚡ **Performance optimisée** - Utilisation de Vite pour un build rapide  
🎨 **Notifications toast** - Feedback utilisateur en temps réel  

## Stack technique

### Core Technologies
- **React 18.3.1** - Bibliothèque UI avec hooks modernes
- **TypeScript 5.5.3** - Typage statique pour la robustesse
- **Vite 5.4.2** - Build tool ultra-rapide

### Styling & UI
- **Tailwind CSS 3.4.1** - Framework CSS utility-first
- **Lucide React 0.344.0** - Icônes modernes et cohérentes
- **PostCSS 8.4.35** - Processeur CSS
- **Google Fonts (Inter)** - Typographie professionnelle

### Development Tools
- **ESLint 9.9.1** - Linting et qualité du code
- **TypeScript ESLint 8.3.0** - Règles spécifiques TypeScript
- **Autoprefixer 10.4.18** - Préfixes CSS automatiques

## Structure du projet

```
frontend/
├── public/                 # Fichiers statiques
├── src/
│   ├── components/         # Composants React réutilisables
│   │   ├── AnalysisResults.tsx    # Affichage des résultats
│   │   ├── DocumentUpload.tsx     # Upload de documents
│   │   ├── DocumentPreview.tsx    # Aperçu des documents
│   │   ├── HistoryPage.tsx        # Page d'historique
│   │   ├── LoadingSpinner.tsx     # Indicateur de chargement
│   │   ├── Navigation.tsx         # Navigation principale
│   │   ├── RecentAnalyses.tsx     # Analyses récentes
│   │   └── UploadZone.tsx         # Zone de drop
│   ├── context/
│   │   └── AnalysisContext.tsx    # Contexte global
│   ├── services/
│   │   └── analysisService.tsx    # Communication API
│   ├── types/
│   │   └── index.ts              # Définitions TypeScript
│   ├── App.tsx                   # Composant principal
│   ├── main.tsx                  # Point d'entrée
│   └── index.css                 # Styles globaux
├── package.json               # Dépendances et scripts
├── vite.config.ts            # Configuration Vite
├── tailwind.config.js        # Configuration Tailwind
├── tsconfig.json             # Configuration TypeScript
└── Dockerfile               # Container Docker
```

## Installation et démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation locale
```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Build de production
npm run build

# Preview du build de production
npm run preview

# Linting du code
npm run lint
```

### Avec Docker
```bash
# Construction de l'image
docker build -t frontend .

# Lancement du container
docker run -p 5173:5173 frontend
```

### Avec Docker Compose
```bash
# Depuis la racine du projet
docker-compose up frontend
```

## Configuration

### Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL de l'API gateway | `http://localhost:3001/ia-service` |
| `VITE_DB_SERVICE_URL` | URL du service de base de données | `http://localhost:3001/db-service/api` |

### Exemple de fichier .env
```env
VITE_API_URL=http://localhost:3001/ia-service
VITE_DB_SERVICE_URL=http://localhost:3001/db-service/api
```

## Composants principaux

### `<App />` - Composant racine
- Gestion de l'état global de l'application
- Routing entre les pages (Home/History)
- Système de notifications toast
- Coordination des fonctionnalités

### `<DocumentUpload />` - Upload de documents
- Zone de glisser-déposer interactive
- Validation des fichiers PDF
- Barre de progression d'upload
- Gestion des erreurs

### `<AnalysisResults />` - Affichage des résultats
- Résumé structuré du document
- Liste des points clés
- Actions recommandées avec priorités
- Métriques de confiance et temps de traitement

### `<HistoryPage />` - Gestion de l'historique
- Liste paginée des analyses précédentes
- Recherche et filtrage avancés
- Statistiques d'utilisation
- Actions de suppression

### `<Navigation />` - Navigation principale
- Menu responsive
- Indicateurs de page active
- Logo et branding

## Services et API

### `analysisService` - Interface API
```typescript
// Récupération des analyses
getAllAnalyses(page, limit, search): Promise<AnalysesResponse>

// Analyse spécifique
getAnalysisById(id): Promise<AnalysisResponse>

// Analyses récentes
getRecentAnalyses(limit): Promise<Analysis[]>

// Suppression
deleteAnalysis(id): Promise<{success: boolean}>

// Recherche avancée
searchAnalyses(query, minWords, maxWords): Promise<SearchResponse>

// Statistiques
getStats(): Promise<StatsResponse>
```

## Types TypeScript

### Interfaces principales
```typescript
interface Analysis {
  id: string;
  documentName: string;
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  confidence: number;
  processingTime: number;
  createdAt: string;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
}
```

## Développement

### Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarrage du serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Preview du build |
| `npm run lint` | Vérification du code |

### Standards de code
- **ESLint** configuré avec les règles React
- **TypeScript strict** pour la sécurité des types
- **Prettier** pour le formatage automatique (recommandé)

### Architecture des composants
```typescript
// Structure type d'un composant
interface ComponentProps {
  // Props typées
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks en haut
  const [state, setState] = useState();
  
  // Fonctions métier
  const handleAction = useCallback(() => {
    // Logique
  }, []);
  
  // Render
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
};
```

### Ajout de nouvelles fonctionnalités

1. **Nouveau composant**
```bash
# Créer le fichier
touch src/components/NewComponent.tsx

# Structure de base
export const NewComponent: React.FC = () => {
  return <div>New Component</div>;
};
```

2. **Nouveau service**
```typescript
// Dans src/services/newService.ts
export const newService = {
  async getData(): Promise<Data> {
    const response = await fetch('/api/endpoint');
    return response.json();
  }
};
```

3. **Nouveaux types**
```typescript
// Dans src/types/index.ts
export interface NewType {
  id: string;
  name: string;
}
```

## Responsive Design

L'application utilise les breakpoints Tailwind CSS :

| Breakpoint | Taille | Usage |
|------------|--------|-------|
| `sm` | 640px+ | Téléphones en mode paysage |
| `md` | 768px+ | Tablettes |
| `lg` | 1024px+ | Laptops |
| `xl` | 1280px+ | Desktops |

## Performance

### Optimisations implémentées
- **Code splitting** automatique avec Vite
- **Lazy loading** des composants lourds
- **Memoization** avec React.memo et useMemo
- **Debouncing** sur les recherches
- **Optimisation des images** avec formats modernes

### Métriques cibles
- **FCP** (First Contentful Paint) < 1.5s
- **LCP** (Largest Contentful Paint) < 2.5s
- **CLS** (Cumulative Layout Shift) < 0.1
- **Bundle size** < 500KB (gzipped)

## Accessibilité

### Standards respectés
- **WCAG 2.1 AA** - Guidelines d'accessibilité
- **Semantic HTML** - Structure sémantique
- **ARIA labels** - Labels d'accessibilité
- **Keyboard navigation** - Navigation au clavier
- **Screen reader** compatible

### Tests d'accessibilité
```bash
# Installation d'outils de test
npm install --save-dev @axe-core/react

# Dans les tests
import axe from '@axe-core/react';
axe(React, ReactDOM, 1000);
```

## Tests

### Framework recommandé
```bash
# Installation
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Configuration dans vite.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts']
  }
});
```

### Exemple de test
```typescript
import { render, screen } from '@testing-library/react';
import { App } from './App';

test('renders upload zone', () => {
  render(<App />);
  expect(screen.getByText(/glissez votre fichier/i)).toBeInTheDocument();
});
```

## Déploiement

### Build de production
```bash
# Build optimisé
npm run build

# Fichiers générés dans dist/
ls dist/
```

### Optimisations production
- **Minification** automatique des assets
- **Tree shaking** pour réduire le bundle
- **Compression Gzip/Brotli** recommandée
- **CDN** pour les assets statiques

### Variables d'environnement production
```env
VITE_API_URL=https://your-api-domain.com/ia-service
VITE_DB_SERVICE_URL=https://your-api-domain.com/db-service/api
```

## Dépannage

### Problèmes courants

**Le serveur de développement ne démarre pas**
```bash
# Nettoyer les dépendances
rm -rf node_modules package-lock.json
npm install

# Vérifier le port
lsof -i :5173
```

**Build en erreur**
```bash
# Vérifier les types TypeScript
npx tsc --noEmit

# Vérifier ESLint
npm run lint
```

**Upload de fichiers en erreur**
- Vérifier que l'API gateway est accessible
- Contrôler les variables d'environnement
- Vérifier la taille des fichiers (limite 50MB)

**Interface non responsive**
- Vérifier les classes Tailwind CSS
- Contrôler les breakpoints
- Tester sur différents appareils

## Sécurité

### Mesures implémentées
- **CSP** (Content Security Policy) recommandé
- **HTTPS** en production
- **Validation côté client** des fichiers
- **Sanitisation** des données utilisateur

### Headers de sécurité recommandés
```nginx
# Configuration Nginx
add_header X-Frame-Options SAMEORIGIN;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
```

## Licence

Ce projet fait partie du système Apocalipssi IA Summarizer.

---

Pour plus d'informations sur l'API backend, consultez les README des services correspondants.
