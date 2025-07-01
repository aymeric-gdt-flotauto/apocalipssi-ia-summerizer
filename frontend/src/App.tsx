import React, { useState, useCallback } from 'react';
import { Brain, Sparkles, FileCheck, X, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { AnalysisProvider, useAnalysis } from './context/AnalysisContext';
import { Analysis } from './services/analysisService';
import { Navigation } from './components/Navigation';
import { UploadZone } from './components/UploadZone';
import { DocumentPreview } from './components/DocumentPreview';
import { AnalysisResults } from './components/AnalysisResults';
import { LoadingSpinner } from './components/LoadingSpinner';
import HistoryPage from './components/HistoryPage';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
}

const Toast: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
      toast.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
    }`}>
      <div className="flex items-center space-x-3">
        {toast.type === 'error' ? (
          <AlertCircle size={20} className="text-red-600" />
        ) : (
          <CheckCircle size={20} className="text-green-600" />
        )}
        <p className={`text-sm font-medium ${
          toast.type === 'error' ? 'text-red-800' : 'text-green-800'
        }`}>
          {toast.message}
        </p>
        <button
          onClick={() => onClose(toast.id)}
          className={`p-1 rounded hover:bg-opacity-20 ${
            toast.type === 'error' ? 'hover:bg-red-600' : 'hover:bg-green-600'
          }`}
        >
          <X size={16} className={toast.type === 'error' ? 'text-red-600' : 'text-green-600'} />
        </button>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'history'>('home');
  const [document, setDocument] = useState<Document | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Analysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const { recentAnalyses, refreshAfterScan, loadAnalysisById } = useAnalysis();

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, message };

    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.includes('pdf')) {
      showToast('error', 'Seuls les fichiers PDF sont acceptés.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast('error', 'Le fichier ne doit pas dépasser 50MB.');
      return;
    }

    const newDocument: Document = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      status: 'uploading'
    };

    setDocument(newDocument);
    setAnalysisResult(null);
    setIsProcessing(true);
    showToast('success', 'Fichier téléchargé avec succès');

    try {
      setTimeout(() => {
        setDocument(prev => prev ? { ...prev, status: 'processing' } : null);
      }, 1000);

      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const result = await response.json();

      // Transformer en objet Analysis complet
      const analysis: Analysis = {
        id: Math.random().toString(36).substr(2, 9),
        documentName: result.documentName || file.name,
        summary: result.summary,
        keyPoints: result.keyPoints || [],
        actionItems: result.actionItems || [],
        confidence: result.confidence || 0,
        processingTime: result.processingTime || 0,
        createdAt: new Date().toISOString()
      };

      const completedDocument = { ...newDocument, status: 'completed' as const };
      setDocument(completedDocument);
      setAnalysisResult(analysis);
      showToast('success', 'Analyse terminée avec succès');

      // Mettre à jour la base de données et les analyses récentes
      await refreshAfterScan(analysis);

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setDocument(prev => prev ? { ...prev, status: 'error' } : null);
      showToast('error', 'Erreur lors de l\'analyse du document');
    } finally {
      setIsProcessing(false);
    }
  }, [refreshAfterScan]);

  const handleNewDocument = useCallback(() => {
    setDocument(null);
    setAnalysisResult(null);
    setIsProcessing(false);
  }, []);

  const handleViewAnalysis = useCallback(async (analysis: Analysis) => {
    try {
      // Si c'est juste un ID, charger l'analyse complète
      if (analysis.id && !analysis.summary) {
        await loadAnalysisById(analysis.id);
      } else {
        setAnalysisResult(analysis);
      }

      // Créer un document factice pour l'affichage
      const fakeDocument: Document = {
        id: analysis.id,
        name: analysis.documentName || 'Document',
        size: 0,
        type: 'application/pdf',
        uploadedAt: new Date(analysis.createdAt),
        status: 'completed'
      };

      setDocument(fakeDocument);
      setCurrentPage('home');
    } catch (error) {
      showToast('error', 'Erreur lors du chargement de l\'analyse');
    }
  }, [loadAnalysisById]);

  const handleDeleteEntry = useCallback((id: string) => {
    // Cette fonction sera gérée par le composant HistoryPage
    showToast('success', 'Entrée supprimée de l\'historique');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}

      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'history' ? (
          <HistoryPage
            onViewAnalysis={handleViewAnalysis}
            onDeleteEntry={handleDeleteEntry}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {!document ? (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Analysez vos documents en quelques secondes
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Téléchargez votre PDF et obtenez instantanément un résumé structuré,
                      les points clés et des suggestions d'actions grâce à notre IA avancée.
                    </p>
                  </div>

                  <UploadZone onFileUpload={handleFileUpload} isProcessing={isProcessing} />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                      <div className="p-3 bg-blue-100 rounded-full inline-block mb-4">
                        <Brain size={24} className="text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">IA Avancée</h3>
                      <p className="text-sm text-gray-600">Analyse sémantique profonde de vos documents</p>
                    </div>

                    <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                      <div className="p-3 bg-teal-100 rounded-full inline-block mb-4">
                        <Sparkles size={24} className="text-teal-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Résultats Instantanés</h3>
                      <p className="text-sm text-gray-600">Synthèse générée en moins de 10 secondes</p>
                    </div>

                    <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                      <div className="p-3 bg-orange-100 rounded-full inline-block mb-4">
                        <FileCheck size={24} className="text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Actions Ciblées</h3>
                      <p className="text-sm text-gray-600">Recommandations personnalisées et priorisées</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Analyse du Document</h2>
                    <button
                      onClick={handleNewDocument}
                      className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Sparkles size={20} className="mr-2" />
                      Nouveau Document
                    </button>
                  </div>

                  <DocumentPreview document={document} />

                  {isProcessing && (
                    <div className="bg-white rounded-xl shadow-lg">
                      <LoadingSpinner />
                    </div>
                  )}

                  {analysisResult && !isProcessing && (
                    <AnalysisResults results={analysisResult} />
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Comment ça marche ?</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                    <div>
                      <p className="font-medium text-gray-900">Téléchargez</p>
                      <p className="text-sm text-gray-600">Glissez votre PDF dans la zone d'upload</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                    <div>
                      <p className="font-medium text-gray-900">Analysez</p>
                      <p className="text-sm text-gray-600">Notre IA traite le contenu automatiquement</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <p className="font-medium text-gray-900">Obtenez</p>
                      <p className="text-sm text-gray-600">Résumé, points clés et actions à réaliser</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Types de documents supportés</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Contrats et accords juridiques</li>
                  <li>• Rapports d'analyse financière</li>
                  <li>• Normes et réglementations</li>
                  <li>• Documents techniques</li>
                  <li>• Présentations et études</li>
                </ul>
              </div>

              {recentAnalyses.length > 0 && currentPage === 'home' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Analyses Récentes</h3>
                    <button
                      onClick={() => setCurrentPage('history')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Voir tout
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recentAnalyses.slice(0, 3).map((analysis) => (
                      <div
                        key={analysis.id}
                        onClick={() => handleViewAnalysis(analysis)}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="p-1 bg-blue-100 rounded">
                          <FileText size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {analysis.documentName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Intl.DateTimeFormat('fr-FR', {
                              day: 'numeric',
                              month: 'short'
                            }).format(new Date(analysis.createdAt))}
                          </p>
                        </div>
                        <div className="text-xs text-blue-600 font-medium">
                          {analysis.confidence}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AnalysisProvider>
      <AppContent />
    </AnalysisProvider>
  );
};

export default App;