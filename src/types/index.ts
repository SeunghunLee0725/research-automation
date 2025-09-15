export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publicationDate: Date;
  source: 'google_scholar' | 'pubmed' | 'patent';
  url: string;
  keywords: string[];
  plasmaType?: string;
  parameters?: PlasmaParameters;
  citations?: number;
  doi?: string;
  journal?: string;
  quartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'N/A';
  impactFactor?: number;
  patentNumber?: string;
  // Journal enrichment fields
  impact_factor?: number | null;
  journal_percentage?: string | null;
  journal_category?: string | null;
  journal_rank?: number | null;
}

export interface PlasmaParameters {
  power?: number;
  pressure?: number;
  gasType?: string[];
  temperature?: number;
  treatmentTime?: number;
  frequency?: number;
  voltage?: number;
  electrodeDistance?: number;
}

export interface TrendAnalysis {
  id: string;
  period: string;
  topKeywords: KeywordFrequency[];
  emergingTopics: string[];
  researchGaps: string[];
  publicationCount: number;
  citationTrend: number[];
  timestamp: Date;
}

export interface KeywordFrequency {
  keyword: string;
  count: number;
  trend: 'rising' | 'stable' | 'declining';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  relatedPapers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  title: string;
  type: 'weekly' | 'monthly' | 'custom';
  content: string;
  charts: ChartData[];
  generatedAt: Date;
  papers: Paper[];
  trends: TrendAnalysis;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'scatter';
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
}

export interface Researcher {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'researcher' | 'professor';
  specialization: string[];
  tasks: Task[];
}