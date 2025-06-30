import React from 'react';
import { Brain } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain size={24} className="text-blue-600 animate-pulse" />
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Analyse en cours...
        </h3>
        <p className="text-sm text-gray-600">
          Notre IA analyse votre document
        </p>
      </div>
    </div>
  );
};