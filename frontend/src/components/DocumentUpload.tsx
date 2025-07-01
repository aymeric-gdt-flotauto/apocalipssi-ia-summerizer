import React, { useState, useRef } from 'react';
import { Analysis } from '../services/analysisService';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onAnalysisComplete }) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    progress: 0,
    error: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadState(prev => ({
          ...prev,
          error: 'Seuls les fichiers PDF sont acceptés'
        }));
        return;
      }

      setUploadState(prev => ({
        ...prev,
        file,
        error: null
      }));
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadState(prev => ({
          ...prev,
          error: 'Seuls les fichiers PDF sont acceptés'
        }));
        return;
      }

      setUploadState(prev => ({
        ...prev,
        file,
        error: null
      }));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const uploadFile = async (): Promise<void> => {
    if (!uploadState.file) return;

    setUploadState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null
    }));

    try {
      const formData = new FormData();
      formData.append('file', uploadState.file);

      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse du document');
      }

      const analysisData: AnalysisApiResponse = await response.json();

      // Transformer en objet Analysis avec un ID et createdAt
      const analysis: Analysis = {
        id: Math.random().toString(36).substr(2, 9),
        documentName: analysisData.documentName,
        summary: analysisData.summary,
        keyPoints: analysisData.keyPoints,
        actionItems: analysisData.actionItems,
        confidence: analysisData.confidence,
        processingTime: analysisData.processingTime,
        createdAt: new Date().toISOString()
      };

      setUploadState(prev => ({
        ...prev,
        uploading: false,
        progress: 100
      }));

      // Appeler le callback avec l'analyse complète
      onAnalysisComplete(analysis);

      // Reset le formulaire
      setTimeout(() => {
        setUploadState({
          file: null,
          uploading: false,
          progress: 0,
          error: null
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }));
    }
  };

  const resetUpload = (): void => {
    setUploadState({
      file: null,
      uploading: false,
      progress: 0,
      error: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analyseur de Documents
        </h2>
        <p className="text-gray-600 mb-6">
          Uploadez un document PDF pour obtenir une analyse automatique
        </p>

        {!uploadState.file ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-2">
              Glissez votre PDF ici ou cliquez pour sélectionner
            </p>
            <p className="text-sm text-gray-500">
              Formats supportés: PDF uniquement
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="font-medium text-blue-900">
                {uploadState.file.name}
              </span>
              <span className="text-sm text-blue-700">
                ({Math.round(uploadState.file.size / 1024)} KB)
              </span>
            </div>

            {uploadState.uploading && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Analyse en cours... {uploadState.progress}%
                </p>
              </div>
            )}

            {uploadState.progress === 100 && !uploadState.uploading && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Analyse terminée !</span>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={uploadFile}
                disabled={uploadState.uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploadState.uploading ? 'Analyse...' : 'Analyser le document'}
              </button>

              <button
                onClick={resetUpload}
                disabled={uploadState.uploading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {uploadState.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Erreur</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{uploadState.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;