interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface Analysis {
  id: string;
  documentName: string;
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  confidence: number;
  processingTime: number;
  wordCount?: number;
  shortSummary?: string;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface AnalysesResponse {
  success: boolean;
  data: {
    analyses: Analysis[];
    pagination: PaginationData;
  };
}

interface AnalysisResponse {
  success: boolean;
  data: Analysis;
}

interface SearchResponse {
  success: boolean;
  data: {
    analyses: Analysis[];
    total: number;
  };
}

interface StatsResponse {
  success: boolean;
  data: {
    totalAnalyses: number;
    averageWords: number;
    maxWords: number;
    minWords: number;
    recentAnalyses: number;
  };
}

const API_BASE_URL = import.meta.env.REACT_APP_DB_SERVICE_URL || 'http://localhost:3001/db-service/api';

export const analysisService = {
  async getAllAnalyses(page: number = 1, limit: number = 10, search: string = ''): Promise<AnalysesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });

    const response = await fetch(`${API_BASE_URL}/analyses?${params}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des analyses');
    }
    return response.json();
  },

  async getAnalysisById(id: string): Promise<AnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/analyses/${id}`);
    if (!response.ok) {
      throw new Error('Analyse non trouvée');
    }
    return response.json();
  },

  async getRecentAnalyses(limit: number = 5): Promise<Analysis[]> {
    const response = await fetch(`${API_BASE_URL}/analyses?limit=${limit}&page=1`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des analyses récentes');
    }
    const data: AnalysesResponse = await response.json();
    return data.data.analyses;
  },

  async deleteAnalysis(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/analyses/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression');
    }
    return response.json();
  },

  async searchAnalyses(query?: string, minWords?: number, maxWords?: number): Promise<SearchResponse> {
    const params = new URLSearchParams({
      ...(query && { q: query }),
      ...(minWords && { min_words: minWords.toString() }),
      ...(maxWords && { max_words: maxWords.toString() })
    });

    const response = await fetch(`${API_BASE_URL}/analyses/search?${params}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la recherche');
    }
    return response.json();
  },

  async getStats(): Promise<StatsResponse> {
    const response = await fetch(`${API_BASE_URL}/analyses/stats`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
    return response.json();
  }
};

export type { Analysis, ActionItem, PaginationData, AnalysesResponse, AnalysisResponse };