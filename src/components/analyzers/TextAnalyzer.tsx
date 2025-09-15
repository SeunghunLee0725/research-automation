import { apiEndpoints } from '../../config/api';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  Analytics,
  ExpandMore,
  Psychology,
  Description,
} from '@mui/icons-material';
import axios from 'axios';

interface SavedPaperFile {
  filename: string;
  savedAt: string;
  totalCount: number;
  searchInfo?: {
    query?: string;
    sources?: string[];
    yearFrom?: string | null;
    yearTo?: string | null;
  };
}

interface AnalysisResult {
  filename: string;
  analysis: {
    주요연구주제: string[];
    연구방법론: string[];
    핵심발견사항: string[];
    미래연구방향: string[];
    종합요약: string;
  };
  analyzedAt: string;
  cached?: boolean;
}

const TextAnalyzer: React.FC = () => {
  const [savedFiles, setSavedFiles] = useState<SavedPaperFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSavedFiles();
  }, []);

  const loadSavedFiles = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(apiEndpoints.savedPapers);
      setSavedFiles(response.data.files || []);
      setError(null);
    } catch (err) {
      setError('저장된 파일을 불러오는데 실패했습니다.');
      console.error('Error loading saved files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('분석할 파일을 선택해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await axios.post(apiEndpoints.analyzePapers, {
        filename: selectedFile
      });

      setAnalysisResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || '분석 중 오류가 발생했습니다.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Psychology color="primary" />
          Text Analysis with AI
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          저장된 논문 데이터베이스를 선택하여 Perplexity AI로 종합 분석을 수행합니다.
          주요 연구 주제, 방법론, 핵심 발견사항, 미래 연구 방향을 도출합니다.
        </Alert>

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>분석할 논문 데이터베이스 선택</InputLabel>
              <Select
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
                label="분석할 논문 데이터베이스 선택"
                disabled={isAnalyzing}
              >
                <MenuItem value="">
                  <em>선택하세요</em>
                </MenuItem>
                {savedFiles.map((file) => (
                  <MenuItem key={file.filename} value={file.filename}>
                    <Box>
                      <Typography variant="body1">
                        {file.filename}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {file.totalCount}개 논문 • 저장: {formatDateTime(file.savedAt)}
                        {file.searchInfo?.query && ` • 검색어: ${file.searchInfo.query}`}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              startIcon={isAnalyzing ? <CircularProgress size={20} /> : <Analytics />}
              fullWidth
              sx={{ mb: 3 }}
            >
              {isAnalyzing ? 'AI 분석 중...' : 'Perplexity AI로 분석하기'}
            </Button>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {analysisResult && (
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description />
                  분석 결과: {analysisResult.filename}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Typography variant="caption" color="textSecondary">
                    분석 시간: {formatDateTime(analysisResult.analyzedAt)}
                  </Typography>
                  {analysisResult.cached && (
                    <Chip 
                      label="캐시된 결과" 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                  )}
                </Box>

                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      종합 요약
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" paragraph>
                      {analysisResult.analysis.종합요약}
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      주요 연구 주제
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {analysisResult.analysis.주요연구주제.map((topic, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`${index + 1}. ${topic}`} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      연구 방법론
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {analysisResult.analysis.연구방법론.map((method, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`${index + 1}. ${method}`} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      핵심 발견사항
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {analysisResult.analysis.핵심발견사항.map((finding, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`${index + 1}. ${finding}`} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      미래 연구 방향
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {analysisResult.analysis.미래연구방향.map((direction, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`${index + 1}. ${direction}`} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TextAnalyzer;