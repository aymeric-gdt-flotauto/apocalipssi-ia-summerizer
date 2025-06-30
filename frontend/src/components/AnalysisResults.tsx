import React from 'react';
import { FileText, Key, Target, Clock, TrendingUp } from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisResultsProps {
  results: AnalysisResult;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Analyse terminée</h2>
            <p className="opacity-90">Votre document a été analysé avec succès</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{results.confidence}%</div>
              <div className="text-sm opacity-80">Confiance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{results.processingTime}s</div>
              <div className="text-sm opacity-80">Traitement</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <FileText size={24} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Résumé Exécutif</h3>
        </div>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed">{results.summary}</p>
        </div>
      </div>

      {/* Key Points Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-teal-100 rounded-lg mr-3">
            <Key size={24} className="text-teal-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Points Clés</h3>
        </div>
        <div className="space-y-3">
          {results.keyPoints.map((point, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                {index + 1}
              </div>
              <p className="text-gray-700 flex-1">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-orange-100 rounded-lg mr-3">
            <Target size={24} className="text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Actions Recommandées</h3>
        </div>
        <div className="space-y-4">
          {results.actionItems.map((action) => (
            <div key={action.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{action.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getPriorityColor(action.priority)}`}>
                    {getPriorityIcon(action.priority)} {action.priority.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {action.category}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};