import { Analysis } from '../services/analysisService';
export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  url?: string;
}

export interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  confidence: number;
  processingTime: number;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export interface HistoryEntry {
  id: string;
  document: Document;
  analysisResult: AnalysisResult;
  createdAt: Date;
  tags?: string[];
}


// Types pour DocumentUpload
interface DocumentUploadProps {
  onAnalysisComplete: (analysis: Analysis) => void;
}

// Types pour AnalysisResult
interface AnalysisResultProps {
  analysis: Analysis | null;
  onBack: () => void;
  onNewAnalysis: () => void;
}

// Si tu as besoin de typer ton hook d'upload dans DocumentUpload
interface UploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  error: string | null;
}

// Type pour la réponse du service d'analyse Python
interface AnalysisApiResponse {
  summary: string;
  keyPoints: string[];
  actionItems: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
  }>;
  confidence: number;
  processingTime: number;
  documentName: string;
}

export type {
  DocumentUploadProps,
  AnalysisResultProps,
  UploadState,
  AnalysisApiResponse
};