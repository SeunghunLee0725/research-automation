import { apiEndpoints } from '../config/api';
import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function to get auth headers
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }
  
  console.log('Session found, access token:', session.access_token ? 'Present' : 'Missing');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  };
}

// Generic fetch wrapper with auth
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders();
  
  const fullUrl = `${API_BASE_URL}${url}`;
  console.log('Fetching:', fullUrl);
  console.log('Headers:', headers);
  
  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers: {
      ...headers,
      ...options.headers
    },
    body: options.body,
    mode: 'cors' // Explicitly set CORS mode
    // Don't set credentials - let it default to 'same-origin'
  };
  
  console.log('Fetch options:', fetchOptions);
  
  const response = await fetch(fullUrl, fetchOptions);
  
  if (response.status === 401) {
    // Token expired or invalid, sign out
    await supabase.auth.signOut();
    window.location.href = '/auth';
    throw new Error('Authentication required');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }
  
  return response.json();
}

// API methods
export const api = {
  // Papers
  async savePapers(papers: any[], searchInfo: any) {
    return fetchWithAuth('/api/papers/save', {
      method: 'POST',
      body: JSON.stringify({ papers, searchInfo })
    });
  },
  
  async getSavedPapers() {
    return fetchWithAuth('/api/saved-papers');
  },
  
  async deletePaper(id: string) {
    return fetchWithAuth(`/api/saved-papers/${id}`, {
      method: 'DELETE'
    });
  },
  
  // Analysis
  async analyzeText(data: any) {
    return fetchWithAuth('/api/analyze-text', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async getAnalysisResults() {
    return fetchWithAuth('/api/analysis-results');
  },
  
  async getAnalysisResult(id: string) {
    return fetchWithAuth(`/api/analysis-results/${id}`);
  },
  
  // Introductions
  async generateIntroduction(data: any) {
    return fetchWithAuth('/api/generate-introduction', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async saveIntroduction(data: any) {
    return fetchWithAuth('/api/save-introduction', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async getSavedIntroductions() {
    return fetchWithAuth('/api/saved-introductions');
  },
  
  // Paper Plans
  async generatePaperPlan(data: any) {
    return fetchWithAuth('/api/generate-paper-plan', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async savePaperPlan(data: any) {
    return fetchWithAuth('/api/save-paper-plan', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async getPaperPlans() {
    return fetchWithAuth('/api/paper-plans');
  },
  
  async deletePaperPlan(id: string) {
    return fetchWithAuth(`/api/paper-plans/${id}`, {
      method: 'DELETE'
    });
  },
  
  // Search (no auth required for search)
  async searchGoogleScholar(params: any) {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/api/scholar?${queryString}`).then(res => res.json());
  },
  
  async searchPubMed(params: any) {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/api/pubmed/search?${queryString}`).then(res => res.json());
  },
  
  async searchUSPTO(params: any) {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/api/uspto/search?${queryString}`).then(res => res.json());
  }
};