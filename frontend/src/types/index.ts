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