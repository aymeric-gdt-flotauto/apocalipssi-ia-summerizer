import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Document } from '../types';

interface DocumentPreviewProps {
  document: Document;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document }) => {
  const getStatusIcon = () => {
    switch (document.status) {
      case 'uploading':
        return <Clock className="animate-spin" size={20} />;
      case 'processing':
        return <Clock className="animate-pulse" size={20} />;
      case 'completed':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      default:
        return <FileText size={20} />;
    }
  };

  const getStatusColor = () => {
    switch (document.status) {
      case 'uploading':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-orange-600 bg-orange-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = () => {
    switch (document.status) {
      case 'uploading':
        return 'Téléchargement...';
      case 'processing':
        return 'Analyse en cours...';
      case 'completed':
        return 'Analyse terminée';
      case 'error':
        return 'Erreur d\'analyse';
      default:
        return 'En attente';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <FileText size={24} className="text-blue-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {document.name}
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            {formatFileSize(document.size)} • PDF
          </p>
          
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="ml-2">{getStatusText()}</span>
          </div>
        </div>
      </div>
      
      {document.status === 'processing' && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Analyse en cours avec IA...</p>
        </div>
      )}
    </div>
  );
};