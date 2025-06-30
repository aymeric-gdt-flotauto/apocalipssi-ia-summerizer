import React from 'react';
import { Brain, FileText, History, Home } from 'lucide-react';

interface NavigationProps {
  currentPage: 'home' | 'history';
  onPageChange: (page: 'home' | 'history') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  return (
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
          
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange('home')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'home'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home size={20} className="mr-2" />
              Accueil
            </button>
            
            <button
              onClick={() => onPageChange('history')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'history'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <History size={20} className="mr-2" />
              Historique
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};