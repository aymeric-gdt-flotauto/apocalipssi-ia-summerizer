import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileUpload, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      onFileUpload(pdfFile);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  return (
    <div 
      className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
        isDragOver 
          ? 'border-blue-500 bg-blue-50 scale-105' 
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center space-y-6">
        <div className={`p-6 rounded-full transition-all duration-300 ${
          isDragOver ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
        }`}>
          <Upload size={48} />
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Glissez votre document PDF ici
          </h3>
          <p className="text-gray-600 mb-6">
            ou cliquez pour sélectionner un fichier
          </p>
          
          <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <FileText size={20} className="mr-2" />
            Sélectionner un PDF
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isProcessing}
            />
          </label>
        </div>
        
        <p className="text-sm text-gray-500">
          Formats supportés: PDF • Taille max: 50MB
        </p>
      </div>
    </div>
  );
};