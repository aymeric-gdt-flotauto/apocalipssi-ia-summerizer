import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { Analysis } from '../services/analysisService';
import { Clock, FileText, TrendingUp } from 'lucide-react';

interface RecentAnalysesProps {
  onAnalysisSelect: (analysis: Analysis) => void;
}

const RecentAnalyses: React.FC<RecentAnalysesProps> = ({ onAnalysisSelect }) => {
  const { recentAnalyses, loading } = useAnalysis();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const handleShowHistory = (): void => {
    window.dispatchEvent(new CustomEvent('showHistory'));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Analyses récentes</h3>
      </div>

      {recentAnalyses.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Aucune analyse récente</p>
          <p className="text-gray-400 text-sm mt-1">
            Analysez un document pour voir les résultats ici
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentAnalyses.map((analysis) => (
            <div
              key={analysis.id}
              onClick={() => onAnalysisSelect(analysis)}
              className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {analysis.documentName || 'Document sans nom'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {analysis.shortSummary || analysis.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatDate(analysis.createdAt)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(analysis.confidence)}`}>
                      {analysis.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {recentAnalyses.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={handleShowHistory}
            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Voir tout l'historique →
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentAnalyses;