// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function to construct API endpoints
export const apiEndpoints = {
  // Scholar/PubMed/USPTO search (public endpoints)
  scholar: `${API_BASE_URL}/api/scholar`,
  pubmedSearch: `${API_BASE_URL}/api/pubmed/search`,
  usptoSearch: `${API_BASE_URL}/api/uspto/search`,
  
  // Papers endpoints (authenticated)
  savePapers: `${API_BASE_URL}/api/papers/save`,
  savedPapers: `${API_BASE_URL}/api/saved-papers`,
  deletePaper: (id: string) => `${API_BASE_URL}/api/saved-papers/${encodeURIComponent(id)}`,
  
  // Analysis endpoints
  analyzePapers: `${API_BASE_URL}/api/analyze-papers`,
  analyze: `${API_BASE_URL}/api/analyze`,
  trends: `${API_BASE_URL}/api/trends`,
  trendsWithFile: (file: string) => `${API_BASE_URL}/api/trends?file=${file}`,
  authorPapers: (author: string) => `${API_BASE_URL}/api/author-papers?author=${encodeURIComponent(author)}`,
  journalPapers: (journal: string) => `${API_BASE_URL}/api/journal-papers?journal=${encodeURIComponent(journal)}`,
  
  // Research analysis
  researchAnalysis: `${API_BASE_URL}/api/research-analysis`,
  enhancedResearchAnalysis: `${API_BASE_URL}/api/enhanced-research-analysis`,
  
  // Introduction generation
  generateIntroduction: `${API_BASE_URL}/api/generate-introduction`,
  paperworkGenerateIntroduction: `${API_BASE_URL}/api/paperwork/generate-introduction`,
  saveIntroduction: `${API_BASE_URL}/api/save-introduction`,
  savedIntroductions: `${API_BASE_URL}/api/saved-introductions`,
  deleteIntroduction: (id: string) => `${API_BASE_URL}/api/saved-introductions/${id}`,
  getIntroduction: (id: string) => `${API_BASE_URL}/api/saved-introductions/${id}`,
  
  // Paper plans
  generatePaperPlan: `${API_BASE_URL}/api/generate-paper-plan`,
  savePaperPlan: `${API_BASE_URL}/api/save-paper-plan`,
  paperPlans: `${API_BASE_URL}/api/paper-plans`,
  deletePaperPlan: (id: string) => `${API_BASE_URL}/api/paper-plans/${id}`,
  
  // Analysis results
  analysisResults: `${API_BASE_URL}/api/analysis-results`,
  getAnalysisResult: (id: string) => `${API_BASE_URL}/api/analysis-results/${id}`,
  
  // Saved analyses
  savedAnalyses: `${API_BASE_URL}/api/saved-analyses`,
  getSavedAnalysis: (id: string) => `${API_BASE_URL}/api/saved-analyses/${id}`,
  deleteSavedAnalysis: (id: string) => `${API_BASE_URL}/api/saved-analyses/${id}`,
  
  // Settings
  settingsTemperature: `${API_BASE_URL}/api/settings/temperature`,
  settingsApiKeyStatus: `${API_BASE_URL}/api/settings/api-key-status`,
  settingsApiKey: `${API_BASE_URL}/api/settings/api-key`,
  
  // File operations
  getSavedPapersFile: (file: string) => `${API_BASE_URL}/api/saved-papers/${file}`,
};

export default API_BASE_URL;