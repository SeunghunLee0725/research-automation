import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedPaper {
  id: string;
  user_id: string;
  title: string;
  authors?: string[];
  abstract?: string;
  journal?: string;
  publication_date?: string;
  doi?: string;
  url?: string;
  source: 'google_scholar' | 'pubmed' | 'uspto';
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  id: string;
  user_id: string;
  title: string;
  analysis_type: 'trend' | 'text' | 'comparative';
  input_data: any;
  results: any;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface PaperIntroduction {
  id: string;
  user_id: string;
  title: string;
  introduction_text: string;
  keywords?: string[];
  paper_references?: any;
  created_at: string;
  updated_at: string;
}

export interface PaperPlan {
  id: string;
  user_id: string;
  title: string;
  research_question?: string;
  methodology?: string;
  expected_outcomes?: string;
  timeline?: any;
  resources?: any;
  status: 'draft' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  query: string;
  source: string;
  filters?: any;
  results_count?: number;
  created_at: string;
}