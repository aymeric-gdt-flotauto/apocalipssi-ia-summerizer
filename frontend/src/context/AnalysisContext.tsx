import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { analysisService, Analysis, PaginationData } from '../services/analysisService';

interface AnalysisState {
  analyses: Analysis[];
  recentAnalyses: Analysis[];
  currentAnalysis: Analysis | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationData;
}

type AnalysisAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ANALYSES'; payload: { analyses: Analysis[]; pagination: PaginationData } }
  | { type: 'SET_RECENT_ANALYSES'; payload: Analysis[] }
  | { type: 'SET_CURRENT_ANALYSIS'; payload: Analysis | null }
  | { type: 'ADD_ANALYSIS'; payload: Analysis }
  | { type: 'DELETE_ANALYSIS'; payload: string };

interface AnalysisContextType extends AnalysisState {
  loadAllAnalyses: (page?: number, search?: string) => Promise<void>;
  loadRecentAnalyses: () => Promise<void>;
  loadAnalysisById: (id: string) => Promise<void>;
  deleteAnalysis: (id: string) => Promise<void>;
  refreshAfterScan: (newAnalysis: Analysis) => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

const initialState: AnalysisState = {
  analyses: [],
  recentAnalyses: [],
  currentAnalysis: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  }
};

const analysisReducer = (state: AnalysisState, action: AnalysisAction): AnalysisState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_ANALYSES':
      return {
        ...state,
        analyses: action.payload.analyses,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      };

    case 'SET_RECENT_ANALYSES':
      return {
        ...state,
        recentAnalyses: action.payload,
        loading: false,
        error: null
      };

    case 'SET_CURRENT_ANALYSIS':
      return {
        ...state,
        currentAnalysis: action.payload,
        loading: false,
        error: null
      };

    case 'ADD_ANALYSIS':
      return {
        ...state,
        recentAnalyses: [action.payload, ...state.recentAnalyses.slice(0, 4)]
      };

    case 'DELETE_ANALYSIS':
      return {
        ...state,
        analyses: state.analyses.filter(a => a.id !== action.payload),
        recentAnalyses: state.recentAnalyses.filter(a => a.id !== action.payload)
      };

    default:
      return state;
  }
};

interface AnalysisProviderProps {
  children: ReactNode;
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  const loadAllAnalyses = async (page: number = 1, search: string = ''): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await analysisService.getAllAnalyses(page, state.pagination.limit, search);
      dispatch({ type: 'SET_ANALYSES', payload: response.data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const loadRecentAnalyses = async (): Promise<void> => {
    try {
      const analyses = await analysisService.getRecentAnalyses(5);
      dispatch({ type: 'SET_RECENT_ANALYSES', payload: analyses });
    } catch (error) {
      console.error('Erreur chargement analyses récentes:', error);
    }
  };

  const loadAnalysisById = async (id: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await analysisService.getAnalysisById(id);
      dispatch({ type: 'SET_CURRENT_ANALYSIS', payload: response.data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const deleteAnalysis = async (id: string): Promise<void> => {
    try {
      await analysisService.deleteAnalysis(id);
      dispatch({ type: 'DELETE_ANALYSIS', payload: id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const refreshAfterScan = async (newAnalysis: Analysis): Promise<void> => {
    dispatch({ type: 'ADD_ANALYSIS', payload: newAnalysis });
    await loadRecentAnalyses();
  };

  useEffect(() => {
    loadRecentAnalyses();
  }, []);

  const value: AnalysisContextType = {
    ...state,
    loadAllAnalyses,
    loadRecentAnalyses,
    loadAnalysisById,
    deleteAnalysis,
    refreshAfterScan
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = (): AnalysisContextType => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis doit être utilisé dans AnalysisProvider');
  }
  return context;
};