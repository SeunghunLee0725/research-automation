import { apiEndpoints } from '../../config/api';
import React, { useState, useEffect } from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link as MuiLink,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Grid,
} from '@mui/material';
import { 
  Description,
  CalendarToday,
  Visibility,
  Delete,
  Psychology,
  ExpandMore,
  Analytics
} from '@mui/icons-material';
import axios from 'axios';

interface SavedPaper {
  title: string;
  authors: string[];
  abstract: string;
  url?: string;
  year?: string;
  source: string;
  journal?: string;
  doi?: string;
  impact_factor?: number | null;
  journal_percentage?: string | null;  // Changed to string to handle Korean text like "10% 이내"
  journal_category?: string | null;
  journal_rank?: number | null;
}

interface SavedPaperFile {
  filename: string;
  savedAt: string;
  totalCount: number;
  papers: SavedPaper[];
  searchInfo?: {
    query?: string;
    sources?: string[];
    yearFrom?: string | null;
    yearTo?: string | null;
    maxResults?: string | null;
  };
  analysisResult?: {
    analysis: any;
    analyzedAt: string;
  };
}

const SavedPapers: React.FC = () => {
  const [savedFiles, setSavedFiles] = useState<SavedPaperFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<SavedPaperFile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const { analysisTasks, startAnalysis, getAnalysisStatus } = useAnalysis();

  useEffect(() => {
    loadSavedFiles();
  }, []);

  const loadSavedFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(apiEndpoints.savedPapers);
      setSavedFiles(response.data.files || []);
      setError(null);
    } catch (err) {
      setError('저장된 파일을 불러오는데 실패했습니다.');
      console.error('Error loading saved files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = (file: SavedPaperFile) => {
    setSelectedFile(file);
    setDialogOpen(true);
  };

  const handleViewAnalysis = (file: SavedPaperFile) => {
    if (file.analysisResult) {
      setSelectedAnalysis(file.analysisResult);
      setAnalysisDialogOpen(true);
    }
  };

  const handleAnalyzeFile = async (filename: string) => {
    try {
      await startAnalysis(filename);
      // Reload files after starting analysis
      await loadSavedFiles();
    } catch (err: any) {
      console.error('Error starting analysis:', err);
      alert('분석 시작에 실패했습니다.');
    }
  };

  // Check for completed analyses and show dialog
  useEffect(() => {
    analysisTasks.forEach((task, filename) => {
      if (task.status === 'completed' && task.result && !selectedAnalysis) {
        // Find the file that matches this task
        const file = savedFiles.find(f => f.filename === filename);
        if (file && !file.analysisResult) {
          // Show the analysis result dialog for newly completed analysis
          setSelectedAnalysis(task.result);
          setAnalysisDialogOpen(true);
          // Reload files to update the UI
          loadSavedFiles();
        }
      }
    });
  }, [analysisTasks, savedFiles]);

  const handleDeleteFile = async (filename: string) => {
    if (!window.confirm('이 파일을 삭제하시겠습니까?')) return;
    
    try {
      await axios.delete(apiEndpoints.deletePaper(filename));
      await loadSavedFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('파일 삭제에 실패했습니다.');
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const formatAuthors = (authors: string[]) => {
    if (!authors || authors.length === 0) return 'Unknown';
    if (authors.length === 1) return authors[0];
    if (authors.length <= 3) return authors.join(', ');
    return `${authors.slice(0, 3).join(', ')} 외 ${authors.length - 3}명`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Description color="primary" />
          저장된 논문 데이터베이스
        </Typography>
        <Typography variant="body1" color="textSecondary">
          저장된 논문 파일들을 조회하고 관리할 수 있습니다.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {savedFiles.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Description sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                저장된 논문이 없습니다
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Paper Collection 페이지에서 논문을 수집하고 저장해보세요.
              </Typography>
            </Paper>
          </Grid>
        ) : (
          savedFiles.map((file, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ minHeight: 300, display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Description color="primary" />
                    <Typography variant="h6" component="div" sx={{ wordBreak: 'break-all' }}>
                      {file.filename}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {formatDateTime(file.savedAt)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={`${file.totalCount}개 논문`} 
                      variant="outlined" 
                      size="small"
                    />
                    {file.analysisResult && (
                      <Chip 
                        icon={<Psychology />}
                        label="AI 분석 완료" 
                        variant="outlined" 
                        size="small"
                        color="success"
                      />
                    )}
                  </Box>
                  
                  {file.searchInfo && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      <strong>검색 정보:</strong>
                      {file.searchInfo.query && (
                        <Box sx={{ mt: 0.5 }}>• 검색어: {file.searchInfo.query}</Box>
                      )}
                      {file.searchInfo.sources && file.searchInfo.sources.length > 0 && (
                        <Box sx={{ mt: 0.5 }}>• 소스: {file.searchInfo.sources.join(', ')}</Box>
                      )}
                      {(file.searchInfo.yearFrom || file.searchInfo.yearTo) && (
                        <Box sx={{ mt: 0.5 }}>
                          • 기간: {file.searchInfo.yearFrom || '시작'} ~ {file.searchInfo.yearTo || '현재'}
                        </Box>
                      )}
                    </Typography>
                  )}
                </CardContent>
                
                <Divider />
                
                <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleViewFile(file)}
                    variant="outlined"
                    sx={{ flexGrow: 1 }}
                  >
                    보기
                  </Button>
                  {file.analysisResult ? (
                    <Button
                      size="small"
                      startIcon={<Analytics />}
                      onClick={() => handleViewAnalysis(file)}
                      variant="outlined"
                      color="success"
                    >
                      분석 보기
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      startIcon={getAnalysisStatus(file.filename)?.status === 'analyzing' ? <CircularProgress size={16} /> : <Psychology />}
                      onClick={() => handleAnalyzeFile(file.filename)}
                      variant="contained"
                      color="primary"
                      disabled={getAnalysisStatus(file.filename)?.status === 'analyzing'}
                    >
                      {getAnalysisStatus(file.filename)?.status === 'analyzing' ? '분석 중...' : 'AI 분석'}
                    </Button>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteFile(file.filename)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { maxHeight: '80vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description />
            {selectedFile?.filename}
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedFile && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  저장 시간: {formatDateTime(selectedFile.savedAt)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  총 {selectedFile.totalCount}개 논문
                </Typography>
              </Box>
              
              <List>
                {selectedFile.papers.map((paper, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                              {paper.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={paper.source.toUpperCase()} 
                                size="small" 
                                variant="outlined"
                                color="primary"
                              />
                              {paper.journal && (
                                <Chip 
                                  label={paper.journal} 
                                  size="small" 
                                  variant="outlined"
                                  color="secondary"
                                />
                              )}
                              {paper.year && (
                                <Chip 
                                  label={paper.year} 
                                  size="small" 
                                  variant="outlined"
                                />
                              )}
                              {paper.impact_factor !== undefined && paper.impact_factor !== null && (
                                <Chip 
                                  label={`IF: ${paper.impact_factor}`} 
                                  size="small" 
                                  variant="filled"
                                  color="success"
                                />
                              )}
                              {paper.journal_percentage !== undefined && paper.journal_percentage !== null && (
                                <Chip 
                                  label={`상위 ${paper.journal_percentage}`} 
                                  size="small" 
                                  variant="filled"
                                  color="info"
                                />
                              )}
                              {paper.journal_rank !== undefined && paper.journal_rank !== null && (
                                <Chip 
                                  label={`Rank: ${paper.journal_rank}`} 
                                  size="small" 
                                  variant="outlined"
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                              저자: {formatAuthors(paper.authors)}
                            </Typography>
                            {paper.journal_category && (
                              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                분야: {paper.journal_category}
                              </Typography>
                            )}
                            {paper.abstract && (
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {paper.abstract.length > 200 
                                  ? `${paper.abstract.substring(0, 200)}...`
                                  : paper.abstract
                                }
                              </Typography>
                            )}
                            {paper.url && (
                              <MuiLink 
                                href={paper.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                variant="body2"
                              >
                                원문 링크
                              </MuiLink>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < selectedFile.papers.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analysis Result Dialog */}
      <Dialog
        open={analysisDialogOpen}
        onClose={() => setAnalysisDialogOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { maxHeight: '80vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology />
            AI 분석 결과
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedAnalysis && (
            <Box>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                분석 시간: {formatDateTime(selectedAnalysis.analyzedAt)}
              </Typography>
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    종합 요약
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" paragraph>
                    {selectedAnalysis.analysis?.종합요약 || '데이터 없음'}
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
                    {(selectedAnalysis.analysis?.주요연구주제 || []).map((topic: string, index: number) => (
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
                    {(selectedAnalysis.analysis?.연구방법론 || []).map((method: string, index: number) => (
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
                    {(selectedAnalysis.analysis?.핵심발견사항 || []).map((finding: string, index: number) => (
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
                    {(selectedAnalysis.analysis?.미래연구방향 || []).map((direction: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemText primary={`${index + 1}. ${direction}`} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setAnalysisDialogOpen(false)}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedPapers;