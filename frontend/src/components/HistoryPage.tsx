import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, FileText, Clock, TrendingUp, Eye, Trash2, Download, Tag } from 'lucide-react';
import { HistoryEntry } from '../types';

interface HistoryPageProps {
  historyEntries: HistoryEntry[];
  onViewAnalysis: (entry: HistoryEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ 
  historyEntries, 
  onViewAnalysis, 
  onDeleteEntry 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'high-confidence'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'confidence'>('date');

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = historyEntries.filter(entry => 
      entry.document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.analysisResult.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply filters
    switch (selectedFilter) {
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter(entry => entry.createdAt >= oneWeekAgo);
        break;
      case 'high-confidence':
        filtered = filtered.filter(entry => entry.analysisResult.confidence >= 85);
        break;
    }

    // Sort entries
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.document.name.localeCompare(b.document.name);
        case 'confidence':
          return b.analysisResult.confidence - a.analysisResult.confidence;
        case 'date':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });
  }, [historyEntries, searchTerm, selectedFilter, sortBy]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Historique des Analyses</h1>
            <p className="opacity-90">Consultez et gérez vos documents analysés</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{historyEntries.length}</div>
            <div className="text-sm opacity-80">Documents</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les documents</option>
              <option value="recent">Cette semaine</option>
              <option value="high-confidence">Haute confiance</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Trier par date</option>
              <option value="name">Trier par nom</option>
              <option value="confidence">Trier par confiance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredAndSortedEntries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
          <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun document trouvé</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Commencez par analyser votre premier document'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedEntries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {entry.document.name}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                        <span>{formatFileSize(entry.document.size)}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(entry.analysisResult.confidence)}`}>
                      {entry.analysisResult.confidence}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                  {entry.analysisResult.summary}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">
                      {entry.analysisResult.keyPoints.length}
                    </div>
                    <div className="text-xs text-gray-600">Points clés</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">
                      {entry.analysisResult.actionItems.length}
                    </div>
                    <div className="text-xs text-gray-600">Actions</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">
                      {entry.analysisResult.processingTime}s
                    </div>
                    <div className="text-xs text-gray-600">Traitement</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => onViewAnalysis(entry)}
                    className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye size={16} className="mr-2" />
                    Voir l'analyse
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Download size={16} />
                    </button>
                    <button 
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};