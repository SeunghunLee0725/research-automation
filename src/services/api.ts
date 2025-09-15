import { apiEndpoints } from '../config/api';
import axios from 'axios';
import { Paper, TrendAnalysis, Task, Report } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const paperService = {
  async searchPapers(query: string, source?: string): Promise<Paper[]> {
    const response = await api.get('/papers/search', { params: { query, source } });
    return response.data;
  },

  async getPaper(id: string): Promise<Paper> {
    const response = await api.get(`/papers/${id}`);
    return response.data;
  },

  async analyzePaper(id: string): Promise<any> {
    const response = await api.post(`/papers/${id}/analyze`);
    return response.data;
  },

  async getRecentPapers(days: number = 7): Promise<Paper[]> {
    const response = await api.get('/papers/recent', { params: { days } });
    return response.data;
  },
};

export const trendService = {
  async getTrends(period: string): Promise<TrendAnalysis> {
    const response = await api.get('/trends', { params: { period } });
    return response.data;
  },

  async analyzeTrends(papers: Paper[]): Promise<TrendAnalysis> {
    const response = await api.post('/trends/analyze', { papers });
    return response.data;
  },
};

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const response = await api.get('/tasks');
    return response.data;
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    const response = await api.post('/tasks', task);
    return response.data;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const response = await api.patch(`/tasks/${id}`, updates);
    return response.data;
  },

  async assignTask(taskId: string, researcherId: string): Promise<Task> {
    const response = await api.post(`/tasks/${taskId}/assign`, { researcherId });
    return response.data;
  },
};

export const reportService = {
  async generateReport(type: string, paperIds: string[]): Promise<Report> {
    const response = await api.post('/reports/generate', { type, paperIds });
    return response.data;
  },

  async getReports(): Promise<Report[]> {
    const response = await api.get('/reports');
    return response.data;
  },

  async getReport(id: string): Promise<Report> {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
};

export const scholarService = {
  async searchGoogleScholar(query: string): Promise<any> {
    const serpApiKey = import.meta.env.VITE_SERPAPI_KEY;
    const url = `https://serpapi.com/search.json?engine=google_scholar&q=${encodeURIComponent(query)}&api_key=${serpApiKey}`;
    const response = await axios.get(url);
    return response.data;
  },
};

export const pubmedService = {
  async searchPubMed(query: string): Promise<any> {
    const apiKey = import.meta.env.VITE_PUBMED_API_KEY;
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&api_key=${apiKey}`;
    const response = await axios.get(url);
    return response.data;
  },
};