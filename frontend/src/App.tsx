import React, { useState, useCallback } from 'react';
import { Brain, Sparkles, FileCheck } from 'lucide-react';
import { UploadZone } from './components/UploadZone';
import { DocumentPreview } from './components/DocumentPreview';
import { AnalysisResults } from './components/AnalysisResults';
import { LoadingSpinner } from './components/LoadingSpinner';
import type { Document, AnalysisResult } from './types';

function App() {
  const [document, setDocument] = useState<Document | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
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

    // Simulate upload
    setTimeout(() => {
      setDocument(prev => prev ? { ...prev, status: 'processing' } : null);
    }, 1000);

    // Simulate AI processing
    setTimeout(() => {
      const mockResult: AnalysisResult = {
        summary: "Ce document présente une analyse détaillée des tendances du marché technologique pour 2024. Il met en évidence les opportunités d'investissement dans l'intelligence artificielle, la cybersécurité et les technologies vertes. Le rapport souligne également les défis réglementaires et les risques potentiels associés à ces secteurs émergents.",
        keyPoints: [
          "Croissance prévue de 35% du marché de l'IA en 2024",
          "Investissements record dans la cybersécurité (2,1 milliards d'euros)",
          "Nouvelles réglementations européennes sur la protection des données",
          "Opportunités significatives dans les technologies vertes",
          "Risques géopolitiques affectant les chaînes d'approvisionnement tech"
        ],
        actionItems: [
          {
            id: '1',
            title: 'Réviser la stratégie d\'investissement IA',
            description: 'Évaluer les opportunités d\'investissement dans les startups IA prometteuses identifiées dans le rapport',
            priority: 'high',
            category: 'Stratégie'
          },
          {
            id: '2',
            title: 'Renforcer la sécurité informatique',
            description: 'Augmenter le budget cybersécurité de 25% pour faire face aux nouvelles menaces',
            priority: 'high',
            category: 'Sécurité'
          },
          {
            id: '3',
            title: 'Formation équipe compliance',
            description: 'Organiser une formation sur les nouvelles réglementations européennes',
            priority: 'medium',
            category: 'Conformité'
          },
          {
            id: '4',
            title: 'Exploration technologies vertes',
            description: 'Étudier les partenariats potentiels dans le secteur des technologies durables',
            priority: 'medium',
            category: 'Innovation'
          }
        ],
        confidence: 92,
        processingTime: 4.2
      };

      setDocument(prev => prev ? { ...prev, status: 'completed' } : null);
      setAnalysisResult(mockResult);
      setIsProcessing(false);
    }, 5000);
  }, []);

  const handleNewDocument = useCallback(() => {
    setDocument(null);
    setAnalysisResult(null);
    setIsProcessing(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Brain size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DocuMind AI</h1>
                <p className="text-sm text-gray-600">Assistant intelligent de synthèse documentaire</p>
              </div>
            </div>
            
            {document && (
              <button
                onClick={handleNewDocument}
                className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Sparkles size={20} className="mr-2" />
                Nouveau Document
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
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
                
                {/* Features */}
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

          {/* Sidebar */}
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;