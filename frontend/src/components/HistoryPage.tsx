import React, { useEffect, useState, useMemo } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { Analysis } from '../services/analysisService';
import { Clock, FileText, Search, Trash2, Eye, Calendar, TrendingUp } from 'lucide-react';

interface HistoryPageProps {
  onViewAnalysis: (analysis: Analysis) => void;
  onDeleteEntry: (id: string) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onViewAnalysis, onDeleteEntry }) => {
  const {
    analyses,
    loading,
    error,
    loadAllAnalyses,
    deleteAnalysis
  } = useAnalysis();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const parseArrayField = (field: string | any[]): any[] => {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    return [];
  };

  const filteredAnalyses = useMemo(() => {
    if (!searchTerm.trim()) return analyses;

    return analyses.filter(analysis => {
      const searchLower = searchTerm.toLowerCase();
      return (
        analysis.documentName?.toLowerCase().includes(searchLower) ||
        analysis.summary?.toLowerCase().includes(searchLower) ||
        analysis.shortSummary?.toLowerCase().includes(searchLower)
      );
    });
  }, [analyses, searchTerm]);

  const paginatedAnalyses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAnalyses.slice(startIndex, endIndex);
  }, [filteredAnalyses, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);

  useEffect(() => {
    loadAllAnalyses();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async (id: string, e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette analyse ?')) {
      try {
        await deleteAnalysis(id);
        onDeleteEntry(id);

        if (paginatedAnalyses.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleView = (analysis: Analysis, e?: React.MouseEvent): void => {
    if (e) e.stopPropagation();
    onViewAnalysis(analysis);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading && analyses.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Historique des analyses</h1>
              <p className="text-gray-600">Retrouvez toutes vos analyses précédentes</p>
            </div>
          </div>

          {analyses.length > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{filteredAnalyses.length}</div>
              <div className="text-sm text-gray-500">
                {searchTerm ? 'résultat(s)' : 'analyses total'}
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher dans les résumés, noms de fichiers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {paginatedAnalyses.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune analyse trouvée</h3>
              {searchTerm ? (
                <p className="text-gray-500">
                  Aucun résultat pour "<span className="font-medium">{searchTerm}</span>".
                  Essayez de modifier votre recherche.
                </p>
              ) : (
                <p className="text-gray-500">
                  Commencez par analyser votre premier document !
                </p>
              )}
            </div>
          ) : (
            paginatedAnalyses.map((analysis) => {
              const keyPoints = parseArrayField(analysis.keyPoints);
              const actionItems = parseArrayField(analysis.actionItems);

              return (
                <div
                  key={analysis.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => handleView(analysis)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate text-lg">
                            {analysis.documentName || 'Document sans nom'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(analysis.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {analysis.processingTime}s
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(analysis.confidence)}`}>
                          {analysis.confidence}% fiabilité
                        </span>
                      </div>

                      <p className="text-gray-700 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {analysis.shortSummary || analysis.summary}
                      </p>

                      <div className="flex items-center gap-6 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {analysis.wordCount || 0} mots
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {keyPoints.length} points clés
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          {actionItems.length} actions
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleView(analysis, e)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Voir l'analyse"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(analysis.id, e)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Précédent
            </button>

            <div className="flex items-center gap-2">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      pageNum === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;