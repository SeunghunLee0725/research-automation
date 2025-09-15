import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Paper, TrendAnalysis, Task, Report, Researcher } from '../types';

interface AppContextType {
  papers: Paper[];
  setPapers: (papers: Paper[]) => void;
  trends: TrendAnalysis | null;
  setTrends: (trends: TrendAnalysis | null) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  reports: Report[];
  setReports: (reports: Report[]) => void;
  researchers: Researcher[];
  setResearchers: (researchers: Researcher[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial data from localStorage if available
    const savedPapers = localStorage.getItem('papers');
    if (savedPapers) {
      setPapers(JSON.parse(savedPapers));
    }

    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    // Save to localStorage when data changes
    if (papers.length > 0) {
      localStorage.setItem('papers', JSON.stringify(papers));
    }
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [papers, tasks]);

  const value: AppContextType = {
    papers,
    setPapers,
    trends,
    setTrends,
    tasks,
    setTasks,
    reports,
    setReports,
    researchers,
    setResearchers,
    loading,
    setLoading,
    error,
    setError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};