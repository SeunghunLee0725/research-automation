import { apiEndpoints } from '../config/api';
import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

interface AnalysisTask {
  filename: string;
  status: 'analyzing' | 'completed' | 'error';
  startedAt: Date;
  result?: any;
  error?: string;
}

interface AnalysisContextType {
  analysisTasks: Map<string, AnalysisTask>;
  startAnalysis: (filename: string) => Promise<void>;
  getAnalysisStatus: (filename: string) => AnalysisTask | undefined;
  clearAnalysisTask: (filename: string) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analysisTasks, setAnalysisTasks] = useState<Map<string, AnalysisTask>>(new Map());

  const startAnalysis = useCallback(async (filename: string) => {
    // Check if already analyzing
    const existingTask = analysisTasks.get(filename);
    if (existingTask && existingTask.status === 'analyzing') {
      console.log(`Already analyzing ${filename}`);
      return;
    }

    // Set analyzing status
    setAnalysisTasks(prev => {
      const newMap = new Map(prev);
      newMap.set(filename, {
        filename,
        status: 'analyzing',
        startedAt: new Date()
      });
      return newMap;
    });

    try {
      // Perform analysis in background
      const response = await axios.post(apiEndpoints.analyzePapers, {
        filename
      });

      // Update with completed status
      setAnalysisTasks(prev => {
        const newMap = new Map(prev);
        newMap.set(filename, {
          filename,
          status: 'completed',
          startedAt: prev.get(filename)?.startedAt || new Date(),
          result: response.data
        });
        return newMap;
      });

      // Show notification (optional)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('AI 분석 완료', {
          body: `${filename} 파일의 분석이 완료되었습니다.`,
          icon: '/logo192.png'
        });
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      
      // Update with error status
      setAnalysisTasks(prev => {
        const newMap = new Map(prev);
        newMap.set(filename, {
          filename,
          status: 'error',
          startedAt: prev.get(filename)?.startedAt || new Date(),
          error: error.response?.data?.error || '분석 중 오류가 발생했습니다.'
        });
        return newMap;
      });
    }
  }, [analysisTasks]);

  const getAnalysisStatus = useCallback((filename: string): AnalysisTask | undefined => {
    return analysisTasks.get(filename);
  }, [analysisTasks]);

  const clearAnalysisTask = useCallback((filename: string) => {
    setAnalysisTasks(prev => {
      const newMap = new Map(prev);
      newMap.delete(filename);
      return newMap;
    });
  }, []);

  return (
    <AnalysisContext.Provider value={{ 
      analysisTasks, 
      startAnalysis, 
      getAnalysisStatus,
      clearAnalysisTask 
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};