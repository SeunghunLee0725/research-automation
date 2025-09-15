import { apiEndpoints } from '../../config/api';
import React, { useState, useEffect } from 'react';
import ContentCopy from '@mui/icons-material/ContentCopy';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore,
  Assessment,
  Science,
  TrendingUp,
  Psychology,
  AutoAwesome,
  CompareArrows,
  FilePresent,
  History,
  Delete,
  Download,
  Edit,
  Article,
  FormatQuote,
  CheckCircleOutline,
  WarningAmber,
} from '@mui/icons-material';
import axios from 'axios';

interface SavedFile {
  filename: string;
  paperCount: number;
  savedAt: string;
  searchInfo?: any;
}

interface SavedAnalysis {
  analysisId: string;
  filename: string;
  createdAt: string;
  selectedFile: string;
  userMethod: string;
}

interface AnalysisResult {
  creativity: {
    score: number;
    description: string;
    innovations?: string[];
    suggestions: string[];
    patentPotential?: string;
  };
  technicalExcellence: {
    score: number;
    description: string;
    strengths: string[];
    improvements: string[];
    statisticalSignificance?: string;
    reproducibility?: string;
  };
  futureDirections: {
    shortTerm: string[];
    mediumTerm?: string[];
    longTerm: string[];
    collaboration: string[];
    fundingOpportunities?: string[];
  };
  comparison: {
    similarities: string[];
    differences: string[];
    advantages: string[];
    complementaryStudies?: string[];
  };
  industrialApplication?: {
    immediateApplications: string[];
    scaleUpConsiderations: string[];
    economicImpact: string;
    environmentalImpact: string;
    regulatoryConsiderations: string;
  };
  dataAnalysis?: {
    keyPerformanceIndicators: string[];
    statisticalValidation: string;
    outlierAnalysis: string;
    trendsIdentified: string[];
    additionalDataNeeded: string[];
  };
}

const ResearchReport: React.FC = () => {
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [experimentMethod, setExperimentMethod] = useState<string>('');
  const [experimentResults, setExperimentResults] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [filesLoading, setFilesLoading] = useState(true);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [analysesLoading, setAnalysesLoading] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [introductionData, setIntroductionData] = useState<any>(null);
  const [generatingIntro, setGeneratingIntro] = useState(false);
  const [savedIntroductions, setSavedIntroductions] = useState<any[]>([]);
  const [showIntroHistory, setShowIntroHistory] = useState(false);
  const [introLoading, setIntroLoading] = useState(false);

  useEffect(() => {
    loadSavedFiles();
    loadSavedAnalyses();
    loadSavedIntroductions();
  }, []);

  const loadSavedIntroductions = async () => {
    try {
      const response = await axios.get(apiEndpoints.savedIntroductions);
      setSavedIntroductions(response.data.introductions || []);
    } catch (error) {
      console.error('Error loading saved introductions:', error);
    }
  };

  const loadIntroduction = async (introId: string) => {
    try {
      setIntroLoading(true);
      const response = await axios.get(apiEndpoints.getIntroduction(introId));
      setIntroductionData(response.data);
      setShowIntroduction(true);
      setShowIntroHistory(false);
    } catch (error) {
      console.error('Error loading introduction:', error);
      setError('Introduction 불러오기 실패');
    } finally {
      setIntroLoading(false);
    }
  };

  const handleLoadIntroduction = (introId: string) => {
    loadIntroduction(introId);
  };

  const deleteIntroduction = async (introId: string) => {
    try {
      await axios.delete(apiEndpoints.getIntroduction(introId));
      loadSavedIntroductions();
    } catch (error) {
      console.error('Error deleting introduction:', error);
      setError('Introduction 삭제 실패');
    }
  };

  const handleDeleteIntroduction = (introId: string) => {
    if (window.confirm('이 Introduction을 삭제하시겠습니까?')) {
      deleteIntroduction(introId);
    }
  };

  const loadSavedAnalyses = async () => {
    try {
      setAnalysesLoading(true);
      const response = await axios.get(apiEndpoints.savedAnalyses);
      setSavedAnalyses(response.data.analyses || []);
    } catch (error) {
      console.error('Error loading saved analyses:', error);
    } finally {
      setAnalysesLoading(false);
    }
  };

  const loadAnalysis = async (analysisId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(apiEndpoints.getSavedAnalysis(analysisId));
      setAnalysisResult(response.data.result);
      setSelectedFile(response.data.metadata.selectedFile);
      setExperimentMethod(response.data.metadata.userResearch.method);
      setExperimentResults(response.data.metadata.userResearch.results);
      setAdditionalNotes(response.data.metadata.userResearch.notes || '');
      setShowHistory(false);
      setShowIntroduction(false); // Reset introduction view
      
      // Load saved introductions for this file
      if (response.data.metadata.selectedFile) {
        await loadSavedIntroductions();
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      setError('분석 결과를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (analysisId: string) => {
    try {
      await axios.delete(apiEndpoints.getSavedAnalysis(analysisId));
      loadSavedAnalyses();
    } catch (error) {
      console.error('Error deleting analysis:', error);
      setError('분석 결과를 삭제하는데 실패했습니다.');
    }
  };

  // Helper function to render text with clickable links
  const renderTextWithLinks = (text: string) => {
    if (!text) return null;
    
    // Parse markdown-style links and convert to JSX
    const parseMarkdownLinks = (input: string) => {
      const parts = [];
      let lastIndex = 0;
      
      // Create a mapping of reference numbers to paper titles
      const referenceMap: { [key: string]: string } = {
        '1': 'The 2020 plasma catalysis roadmap',
        '2': 'Catalyst preparation with plasmas',
        '3': 'Plasma-catalytic removal of formaldehyde',
        '4': 'Plasma catalytic ammonia synthesis',
        '5': 'A multidisciplinary approach to understand the interactions of nonthermal plasma and catalyst',
        '6': 'Plasma catalysis for environmental treatment and energy applications',
        '7': 'Plasma-based CO2 conversion',
        '8': 'Non-thermal plasma technology for the conversion of CO2',
        '9': 'Plasma-catalytic dry reforming of methane',
        '10': 'Advances in plasma catalysis',
      };
      
      // First, handle reference numbers like [1], [2], etc.
      const refRegex = /\[(\d+)\]/g;
      let refMatch;
      const processedParts = [];
      let refLastIndex = 0;
      
      while ((refMatch = refRegex.exec(input)) !== null) {
        // Add text before the reference
        if (refMatch.index > refLastIndex) {
          processedParts.push(input.substring(refLastIndex, refMatch.index));
        }
        
        // Add the reference as a link
        const refNum = refMatch[1];
        const title = referenceMap[refNum] || `Reference ${refNum}`;
        const searchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`;
        
        processedParts.push(
          <a
            key={`ref-${refMatch.index}`}
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              color: '#1976d2', 
              textDecoration: 'none',
              fontWeight: 'bold',
              border: '1px solid #1976d2',
              borderRadius: '3px',
              padding: '0 4px',
              marginLeft: '2px',
              marginRight: '2px'
            }}
          >
            [{refNum}]
          </a>
        );
        
        refLastIndex = refRegex.lastIndex;
      }
      
      // Add remaining text after last reference
      if (refLastIndex < input.length) {
        processedParts.push(input.substring(refLastIndex));
      }
      
      // If no references were found, process the entire input
      if (processedParts.length === 0) {
        processedParts.push(input);
      }
      
      // Now process each text part for markdown links
      const finalParts = [];
      processedParts.forEach((part, partIndex) => {
        if (typeof part === 'string') {
          // Process markdown links in text parts
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
          let match;
          let linkLastIndex = 0;
          const linkParts = [];
          
          while ((match = linkRegex.exec(part)) !== null) {
            if (match.index > linkLastIndex) {
              linkParts.push(part.substring(linkLastIndex, match.index));
            }
            linkParts.push(
              <a
                key={`link-${partIndex}-${match.index}`}
                href={match[2]}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1976d2', textDecoration: 'underline' }}
              >
                {match[1]}
              </a>
            );
            linkLastIndex = linkRegex.lastIndex;
          }
          
          if (linkLastIndex < part.length) {
            linkParts.push(part.substring(linkLastIndex));
          }
          
          if (linkParts.length > 0) {
            finalParts.push(...linkParts);
          } else {
            finalParts.push(part);
          }
        } else {
          // It's already a React element (reference link), add it as is
          finalParts.push(part);
        }
      });
      
      return finalParts.length > 0 ? finalParts : input;
    };
    
    // Auto-detect DOI patterns and convert to links
    const doiPattern = /(10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+)/g;
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    
    let processedText = text;
    
    // First check if there are already markdown links
    if (!text.includes('[') || !text.includes('](')) {
      // Replace DOIs with markdown links
      processedText = processedText.replace(doiPattern, (match) => {
        return `[DOI: ${match}](https://doi.org/${match})`;
      });
      
      // Replace URLs with markdown links
      processedText = processedText.replace(urlPattern, (match) => {
        return `[Link](${match})`;
      });
    }
    
    // Parse and return the processed text with links
    const result = parseMarkdownLinks(processedText);
    return <span>{result}</span>;
  };

  const loadSavedFiles = async () => {
    try {
      setFilesLoading(true);
      const response = await axios.get(apiEndpoints.savedPapers);
      // API returns { files: [...] } structure
      if (response.data && response.data.files && Array.isArray(response.data.files)) {
        const files = response.data.files.map((file: any) => ({
          filename: file.filename,
          paperCount: file.totalCount || file.paperCount || file.papers?.length || 0,
          savedAt: file.savedAt,
          searchInfo: file.searchInfo
        }));
        setSavedFiles(files);
      } else if (Array.isArray(response.data)) {
        setSavedFiles(response.data);
      } else {
        setSavedFiles([]);
      }
    } catch (error) {
      console.error('Error loading saved files:', error);
      setError('파일 목록을 불러오는데 실패했습니다.');
      setSavedFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleFileChange = (event: SelectChangeEvent) => {
    setSelectedFile(event.target.value);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !experimentMethod || !experimentResults) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      const response = await axios.post(apiEndpoints.researchAnalysis, {
        selectedFile,
        userResearch: {
          method: experimentMethod,
          results: experimentResults,
          notes: additionalNotes,
        },
      });

      setAnalysisResult(response.data);
      loadSavedAnalyses(); // Reload saved analyses after new analysis
    } catch (error: any) {
      console.error('Analysis error:', error);
      setError(error.response?.data?.error || '분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const handleGenerateIntroduction = async () => {
    if (!analysisResult || !selectedFile) {
      setError('분석 결과가 필요합니다. 먼저 AI 분석을 수행하세요.');
      return;
    }

    setGeneratingIntro(true);
    setError('');
    
    try {
      const response = await axios.post(apiEndpoints.generateIntroduction, {
        analysisResult,
        selectedFile,
        userResearch: {
          method: experimentMethod,
          results: experimentResults,
          notes: additionalNotes
        },
        config: {
          style: 'Nature',
          wordCount: 1500,
          sections: ['context', 'state-of-art', 'gap', 'innovation', 'objectives', 'significance'],
          citationStyle: 'numbered',
          language: 'en'
        }
      });

      setIntroductionData(response.data);
      setShowIntroduction(true);
      loadSavedIntroductions(); // Reload list after new introduction
    } catch (error: any) {
      console.error('Introduction generation error:', error);
      setError(error.response?.data?.error || 'Introduction 생성 중 오류가 발생했습니다.');
    } finally {
      setGeneratingIntro(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a snackbar notification here
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment color="primary" fontSize="large" />
          연구 비교 분석
        </Typography>
        <Button
          variant="outlined"
          startIcon={<History />}
          onClick={() => setShowHistory(!showHistory)}
          sx={{ ml: 2 }}
        >
          저장된 분석 ({savedAnalyses.length})
        </Button>
      </Box>

      {/* Saved Analyses Panel */}
      {showHistory && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <History color="primary" />
              저장된 분석 기록
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {analysesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : savedAnalyses.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                저장된 분석이 없습니다.
              </Typography>
            ) : (
              <List>
                {savedAnalyses.map((analysis) => (
                  <ListItem
                    key={analysis.analysisId}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {analysis.selectedFile}
                          </Typography>
                          <Chip
                            label={new Date(analysis.createdAt).toLocaleString('ko-KR')}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {analysis.userMethod}
                        </Typography>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Download />}
                        onClick={() => loadAnalysis(analysis.analysisId)}
                      >
                        불러오기
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => deleteAnalysis(analysis.analysisId)}
                      >
                        삭제
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilePresent color="primary" />
                데이터 및 연구 정보 입력
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* File Selection */}
              {filesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>저장된 논문 데이터 선택</InputLabel>
                  <Select
                    value={selectedFile}
                    label="저장된 논문 데이터 선택"
                    onChange={handleFileChange}
                  >
                    <MenuItem value="">
                      <em>선택하세요</em>
                    </MenuItem>
                    {savedFiles && savedFiles.length > 0 ? (
                      savedFiles.map((file) => (
                        <MenuItem key={file.filename} value={file.filename}>
                          {file.filename} ({file.paperCount || 0}개 논문)
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        <em>저장된 파일이 없습니다</em>
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}

              {/* Experiment Method Input */}
              <TextField
                fullWidth
                multiline
                rows={6}
                label="실험 방법"
                placeholder="연구에서 사용한 실험 방법을 자세히 설명해주세요. (예: 플라즈마 생성 조건, 촉매 종류, 반응 온도, 압력 등)"
                value={experimentMethod}
                onChange={(e) => setExperimentMethod(e.target.value)}
                sx={{ mb: 2 }}
                required
              />

              {/* Experiment Results Input */}
              <TextField
                fullWidth
                multiline
                rows={6}
                label="실험 결과"
                placeholder="실험 결과를 구체적으로 입력해주세요. (예: 메탄 전환율, 생성물 선택성, 에너지 효율 등)"
                value={experimentResults}
                onChange={(e) => setExperimentResults(e.target.value)}
                sx={{ mb: 2 }}
                required
              />

              {/* Additional Notes */}
              <TextField
                fullWidth
                multiline
                rows={4}
                label="추가 사항 (선택)"
                placeholder="특별히 강조하고 싶은 점이나 추가 정보가 있다면 입력해주세요."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                sx={{ mb: 3 }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                color="primary"
                onClick={handleAnalyze}
                disabled={loading || !selectedFile || !experimentMethod || !experimentResults}
                fullWidth
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <Psychology />}
              >
                {loading ? '분석 중...' : 'AI 분석 시작'}
              </Button>

              {analysisResult && (
                <>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleGenerateIntroduction}
                    disabled={generatingIntro}
                    fullWidth
                    size="large"
                    startIcon={generatingIntro ? <CircularProgress size={20} /> : <Article />}
                    sx={{ mt: 2 }}
                  >
                    {generatingIntro ? 'Introduction 생성 중...' : '논문 Introduction 작성'}
                  </Button>
                  
                  {savedIntroductions.length > 0 && (
                    <Button
                      variant="outlined"
                      color="info"
                      onClick={() => setShowIntroHistory(!showIntroHistory)}
                      fullWidth
                      size="large"
                      startIcon={<History />}
                      sx={{ mt: 1 }}
                    >
                      저장된 Introduction ({savedIntroductions.length})
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Saved Introductions List - Show when history is toggled */}
          {showIntroHistory && savedIntroductions.length > 0 && analysisResult && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <History color="primary" />
                  저장된 Introduction 목록
                </Typography>
                <List dense>
                  {savedIntroductions.map((intro) => (
                    <ListItem 
                      key={intro.id}
                      sx={{ 
                        bgcolor: 'grey.50', 
                        mb: 1, 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemText
                        primary={intro.title || `Introduction ${intro.id}`}
                        secondary={`${intro.wordCount} 단어 | ${intro.citationCount} 인용 | ${new Date(intro.timestamp).toLocaleDateString()}`}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleLoadIntroduction(intro.id)}
                        sx={{ mr: 1 }}
                      >
                        불러오기
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteIntroduction(intro.id)}
                      >
                        삭제
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Analysis Results Section */}
        <Grid item xs={12} md={6}>
          {showIntroduction && introductionData ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Article color="primary" />
                    논문 Introduction 작성 결과
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<History />}
                      onClick={() => setShowIntroHistory(!showIntroHistory)}
                    >
                      저장된 Introduction ({savedIntroductions.length})
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setShowIntroduction(false)}
                    >
                      분석 결과로 돌아가기
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Download />}
                      onClick={() => {
                        const blob = new Blob(
                          [`${introductionData.manuscript}\n\n${introductionData.references}`],
                          { type: 'text/plain' }
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'introduction_with_references.txt';
                        a.click();
                      }}
                    >
                      다운로드
                    </Button>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {/* Saved Introductions Section */}
                {showIntroHistory && savedIntroductions.length > 0 && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <History color="primary" />
                      저장된 Introduction 목록
                    </Typography>
                    <List dense>
                      {savedIntroductions.map((intro) => (
                        <ListItem 
                          key={intro.id}
                          sx={{ 
                            bgcolor: 'background.paper', 
                            mb: 1, 
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                        >
                          <ListItemText
                            primary={intro.title || `Introduction ${intro.id}`}
                            secondary={`${intro.wordCount} 단어 | ${intro.citationCount} 인용 | ${new Date(intro.timestamp).toLocaleDateString()}`}
                          />
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleLoadIntroduction(intro.id)}
                            sx={{ mr: 1 }}
                          >
                            불러오기
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => handleDeleteIntroduction(intro.id)}
                          >
                            삭제
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Metadata */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                      <Typography variant="h6">
                        {introductionData.metadata?.wordCount || 0}
                      </Typography>
                      <Typography variant="caption">단어 수</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                      <Typography variant="h6">
                        {introductionData.metadata?.citationCount || 0}
                      </Typography>
                      <Typography variant="caption">인용 논문</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
                      <Typography variant="h6">
                        {introductionData.metadata?.recentPapersRatio || '0%'}
                      </Typography>
                      <Typography variant="caption">최신 논문 비율</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                      <Typography variant="h6">
                        50개
                      </Typography>
                      <Typography variant="caption">분석 논문 수</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Manuscript */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Edit color="primary" />
                      Introduction Manuscript
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Paper sx={{ p: 3, bgcolor: 'grey.50', position: 'relative' }}>
                      <Button
                        size="small"
                        startIcon={<ContentCopy />}
                        onClick={() => copyToClipboard(introductionData.manuscript)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        복사
                      </Button>
                      <Typography
                        variant="body1"
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.8,
                          fontFamily: 'Georgia, serif'
                        }}
                      >
                        {introductionData.manuscript}
                      </Typography>
                    </Paper>
                  </AccordionDetails>
                </Accordion>

                {/* References */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormatQuote color="primary" />
                      References ({introductionData.metadata?.citationCount || 0}개)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Paper sx={{ p: 3, bgcolor: 'grey.50', position: 'relative' }}>
                      <Button
                        size="small"
                        startIcon={<ContentCopy />}
                        onClick={() => copyToClipboard(introductionData.references)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        복사
                      </Button>
                      <Typography
                        variant="body2"
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.6,
                          fontFamily: 'monospace',
                          fontSize: '0.85rem'
                        }}
                      >
                        {introductionData.references}
                      </Typography>
                    </Paper>
                  </AccordionDetails>
                </Accordion>

              </CardContent>
            </Card>
          ) : analysisResult ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesome color="primary" />
                  분석 결과
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Creativity Score */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Typography variant="subtitle1">연구의 창의성 및 혁신성</Typography>
                      <Chip 
                        label={`${analysisResult.creativity?.score || 0}/10`}
                        color={getScoreColor(analysisResult.creativity?.score || 0)}
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ '& p': { my: 1 } }}>
                      {renderTextWithLinks(analysisResult.creativity?.description || '')}
                    </Box>
                    {analysisResult.creativity?.innovations && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>혁신적 측면:</Typography>
                        <List dense>
                          {analysisResult.creativity.innovations.map((innovation, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={renderTextWithLinks(`• ${innovation}`)} />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>개선 제안:</Typography>
                    <List dense>
                      {(analysisResult.creativity?.suggestions || []).map((suggestion, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={renderTextWithLinks(`• ${suggestion}`)} />
                        </ListItem>
                      ))}
                    </List>
                    {analysisResult.creativity?.patentPotential && (
                      <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold', color: 'primary.main' }}>
                        특허 가능성: {analysisResult.creativity.patentPotential}
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>

                {/* Technical Excellence */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Typography variant="subtitle1">기술적 우수성 및 과학적 엄밀성</Typography>
                      <Chip 
                        label={`${analysisResult.technicalExcellence?.score || 0}/10`}
                        color={getScoreColor(analysisResult.technicalExcellence?.score || 0)}
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      {analysisResult.technicalExcellence?.description || ''}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>핵심 강점:</Typography>
                    <List dense>
                      {(analysisResult.technicalExcellence?.strengths || []).map((strength, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`• ${strength}`} />
                        </ListItem>
                      ))}
                    </List>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>개선 방향:</Typography>
                    <List dense>
                      {(analysisResult.technicalExcellence?.improvements || []).map((improvement, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`• ${improvement}`} />
                        </ListItem>
                      ))}
                    </List>
                    {analysisResult.technicalExcellence?.statisticalSignificance && (
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        <strong>통계적 유의성:</strong> {analysisResult.technicalExcellence.statisticalSignificance}
                      </Typography>
                    )}
                    {analysisResult.technicalExcellence?.reproducibility && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>재현성:</strong> {analysisResult.technicalExcellence.reproducibility}
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>

                {/* Future Directions */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp color="primary" />
                      <Typography variant="subtitle1">미래 연구 발전 로드맵</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="subtitle2" gutterBottom>단기 목표 (3-6개월):</Typography>
                    <List dense>
                      {(analysisResult.futureDirections?.shortTerm || []).map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`• ${item}`} />
                        </ListItem>
                      ))}
                    </List>
                    {analysisResult.futureDirections?.mediumTerm && (
                      <>
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>중기 목표 (6개월-1년):</Typography>
                        <List dense>
                          {analysisResult.futureDirections.mediumTerm.map((item, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={`• ${item}`} />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>장기 목표 (1-3년):</Typography>
                    <List dense>
                      {(analysisResult.futureDirections?.longTerm || []).map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`• ${item}`} />
                        </ListItem>
                      ))}
                    </List>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>협력 기회:</Typography>
                    <List dense>
                      {(analysisResult.futureDirections?.collaboration || []).map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`• ${item}`} />
                        </ListItem>
                      ))}
                    </List>
                    {analysisResult.futureDirections?.fundingOpportunities && (
                      <>
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>펀딩 기회:</Typography>
                        <List dense>
                          {analysisResult.futureDirections.fundingOpportunities.map((item, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={`• ${item}`} />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                  </AccordionDetails>
                </Accordion>

                {/* Comparison with Literature */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CompareArrows color="primary" />
                      <Typography variant="subtitle1">기존 문헌과의 심층 비교</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="subtitle2" gutterBottom>방법론적 유사점:</Typography>
                    <List dense>
                      {(analysisResult.comparison?.similarities || []).map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={renderTextWithLinks(`• ${item}`)} />
                        </ListItem>
                      ))}
                    </List>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>핵심 차별점:</Typography>
                    <List dense>
                      {(analysisResult.comparison?.differences || []).map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={renderTextWithLinks(`• ${item}`)} />
                        </ListItem>
                      ))}
                    </List>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>경쟁 우위 요소:</Typography>
                    <List dense>
                      {(analysisResult.comparison?.advantages || []).map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={renderTextWithLinks(`• ${item}`)} />
                        </ListItem>
                      ))}
                    </List>
                    {analysisResult.comparison?.complementaryStudies && (
                      <>
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>보완적 선행 연구:</Typography>
                        <List dense>
                          {analysisResult.comparison.complementaryStudies.map((item, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={renderTextWithLinks(`• ${item}`)} />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                  </AccordionDetails>
                </Accordion>

                {/* Industrial Application */}
                {analysisResult.industrialApplication && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Science color="primary" />
                        <Typography variant="subtitle1">실용화 및 산업 응용</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="subtitle2" gutterBottom>즉시 적용 가능 분야:</Typography>
                      <List dense>
                        {analysisResult.industrialApplication.immediateApplications.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={`• ${item}`} />
                          </ListItem>
                        ))}
                      </List>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>스케일업 고려사항:</Typography>
                      <List dense>
                        {analysisResult.industrialApplication.scaleUpConsiderations.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={`• ${item}`} />
                          </ListItem>
                        ))}
                      </List>
                      <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>경제적 영향:</strong> {analysisResult.industrialApplication.economicImpact}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>환경적 영향:</strong> {analysisResult.industrialApplication.environmentalImpact}
                        </Typography>
                        <Typography variant="body2">
                          <strong>규제 고려사항:</strong> {analysisResult.industrialApplication.regulatoryConsiderations}
                        </Typography>
                      </Paper>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Data Analysis */}
                {analysisResult.dataAnalysis && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Assessment color="primary" />
                        <Typography variant="subtitle1">데이터 분석 및 해석</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="subtitle2" gutterBottom>핵심 성능 지표 (KPI):</Typography>
                      <List dense>
                        {analysisResult.dataAnalysis.keyPerformanceIndicators.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={`• ${item}`} />
                          </ListItem>
                        ))}
                      </List>
                      <Paper sx={{ p: 2, mt: 2, bgcolor: 'rgba(33, 150, 243, 0.08)' }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>통계적 검증:</strong> {analysisResult.dataAnalysis.statisticalValidation}
                        </Typography>
                        <Typography variant="body2">
                          <strong>이상치 분석:</strong> {analysisResult.dataAnalysis.outlierAnalysis}
                        </Typography>
                      </Paper>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>식별된 트렌드:</Typography>
                      <List dense>
                        {analysisResult.dataAnalysis.trendsIdentified.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={`• ${item}`} />
                          </ListItem>
                        ))}
                      </List>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>추가 필요 데이터:</Typography>
                      <List dense>
                        {analysisResult.dataAnalysis.additionalDataNeeded.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={`• ${item}`} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box>
                <Science sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  AI 분석 결과가 여기에 표시됩니다
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  왼쪽 패널에서 데이터를 선택하고 연구 정보를 입력한 후 분석을 시작하세요.
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResearchReport;