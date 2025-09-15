import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Avatar,
  ListItemAvatar,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  TrendingUp,
  Person,
  Book,
  Group,
  Label,
  Assessment,
  Refresh,
  ShowChart,
} from '@mui/icons-material';
import CytoscapeNetworkGraph from '../visualizations/CytoscapeNetworkGraph';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface TrendsData {
  authorFrequency: {
    author: string;
    count: number;
    affiliation?: string | null;
    recentPaper?: {
      title: string;
      year?: string;
    };
  }[];
  journalFrequency: {
    journal: string;
    count: number;
    quartile?: string;
    recentPaper?: {
      title: string;
      year?: string;
    };
  }[];
  coauthorGroups: {
    authors: string[];
    collaborations: number;
  }[];
  keywordFrequency: {
    keyword: string;
    count: number;
  }[];
  yearlyDistribution?: {
    year: string;
    count: number;
  }[];
  totalPapers: number;
  totalFiles: number;
}

const TrendAnalysis: React.FC = () => {
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorDetailsOpen, setAuthorDetailsOpen] = useState(false);
  const [journalDetailsOpen, setJournalDetailsOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<any>(null);
  const [selectedJournal, setSelectedJournal] = useState<any>(null);
  const [authorPapers, setAuthorPapers] = useState<any[]>([]);
  const [journalPapers, setJournalPapers] = useState<any[]>([]);
  const [availableFiles, setAvailableFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('all');

  useEffect(() => {
    loadAvailableFiles();
    loadTrendsData();
  }, []);

  useEffect(() => {
    loadTrendsData();
  }, [selectedFile]);

  const loadAvailableFiles = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/saved-papers');
      const files = (response.data.files || []).map((file: any) => ({
        ...file,
        paperCount: file.totalCount || file.paperCount || file.papers?.length || 0
      }));
      setAvailableFiles(files);
    } catch (err) {
      console.error('Error loading files:', err);
    }
  };

  const loadTrendsData = async () => {
    try {
      setLoading(true);
      const url = selectedFile === 'all' 
        ? 'http://localhost:3001/api/trends'
        : `http://localhost:3001/api/trends?file=${selectedFile}`;
      const response = await axios.get(url);
      setTrendsData(response.data);
      setError(null);
    } catch (err: any) {
      setError('트렌드 데이터를 불러오는데 실패했습니다.');
      console.error('Error loading trends:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: SelectChangeEvent) => {
    setSelectedFile(event.target.value);
  };

  const handleAuthorClick = async (author: any) => {
    try {
      setSelectedAuthor(author);
      const response = await axios.get(`http://localhost:3001/api/author-papers?author=${encodeURIComponent(author.author)}`);
      setAuthorPapers(response.data.papers || []);
      setAuthorDetailsOpen(true);
    } catch (err) {
      console.error('Error loading author papers:', err);
      setAuthorPapers([]);
      setAuthorDetailsOpen(true);
    }
  };

  const handleJournalClick = async (journal: any) => {
    try {
      setSelectedJournal(journal);
      const response = await axios.get(`http://localhost:3001/api/journal-papers?journal=${encodeURIComponent(journal.journal)}`);
      setJournalPapers(response.data.papers || []);
      setJournalDetailsOpen(true);
    } catch (err) {
      console.error('Error loading journal papers:', err);
      setJournalPapers([]);
      setJournalDetailsOpen(true);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!trendsData || trendsData.totalPapers === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Assessment sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          분석할 데이터가 없습니다
        </Typography>
        <Typography variant="body2" color="textSecondary">
          먼저 Database에 논문 데이터를 저장해주세요.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp color="primary" />
            연구 트렌드 분석
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel>분석할 파일</InputLabel>
              <Select
                value={selectedFile}
                label="분석할 파일"
                onChange={handleFileChange}
              >
                <MenuItem value="all">전체 파일</MenuItem>
                {availableFiles.map((file: any) => (
                  <MenuItem key={file.filename} value={file.filename}>
                    {file.filename} ({file.paperCount}개)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton onClick={loadTrendsData} color="primary">
              <Refresh />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip 
            label={`총 ${trendsData.totalPapers}개 논문`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`${trendsData.totalFiles}개 데이터베이스 파일`} 
            color="secondary" 
            variant="outlined" 
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Author and Journal Frequency - Side by Side */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person color="primary" />
                저자 빈도 분석 (상위 10명)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {trendsData.authorFrequency.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">데이터 없음</Typography>
                ) : (
                  trendsData.authorFrequency.map((item, index) => (
                    <ListItem key={index} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography 
                                variant="subtitle1" 
                                component="span"
                                sx={{ 
                                  cursor: 'pointer', 
                                  color: 'primary.main',
                                  textDecoration: 'underline',
                                  '&:hover': { color: 'primary.dark' },
                                  fontSize: '1.1rem'
                                }}
                                onClick={() => handleAuthorClick(item)}
                              >
                                {item.author}
                              </Typography>
                              <Chip 
                                label={`${item.count}편`} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </Box>
                            {item.affiliation && (
                              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.85rem' }}>
                                소속: {item.affiliation}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          item.recentPaper && (
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                                최근 논문: {item.recentPaper.title.length > 60 
                                  ? item.recentPaper.title.substring(0, 60) + '...' 
                                  : item.recentPaper.title}
                                {item.recentPaper.year && ` (${item.recentPaper.year})`}
                              </Typography>
                            </Box>
                          )
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Journal Frequency - Right side */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Book color="primary" />
                저널 빈도 분석 (상위 10개)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {trendsData.journalFrequency.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">데이터 없음</Typography>
                ) : (
                  trendsData.journalFrequency.map((item, index) => (
                    <ListItem key={index} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, fontSize: 14 }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                            <Typography 
                              variant="subtitle1" 
                              component="span"
                              sx={{ 
                                cursor: 'pointer', 
                                color: 'secondary.main',
                                textDecoration: 'underline',
                                '&:hover': { color: 'secondary.dark' },
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                                lineHeight: 1.2,
                                flex: 1,
                                fontSize: '1.1rem'
                              }}
                              onClick={() => handleJournalClick(item)}
                            >
                              {item.journal}
                            </Typography>
                            <Chip 
                              label={`${item.count}편`} 
                              size="small" 
                              color="secondary" 
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          item.recentPaper && (
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                                최근 논문: {item.recentPaper.title.length > 60 
                                  ? item.recentPaper.title.substring(0, 60) + '...' 
                                  : item.recentPaper.title}
                                {item.recentPaper.year && ` (${item.recentPaper.year})`}
                              </Typography>
                            </Box>
                          )
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Yearly Paper Distribution Chart */}

        {/* Co-author Network - Interactive Graph Visualization */}
        <Grid item xs={12}>
          <CytoscapeNetworkGraph 
            data={trendsData.coauthorGroups} 
            width={800} 
            height={600} 
          />
        </Grid>

      </Grid>

      {/* Author Details Dialog */}
      <Dialog
        open={authorDetailsOpen}
        onClose={() => setAuthorDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { maxHeight: '80vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person />
            {selectedAuthor?.author} 상세 정보
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedAuthor && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  총 {selectedAuthor.count}편의 논문
                </Typography>
                {selectedAuthor.affiliation && (
                  <Typography variant="body2" color="textSecondary">
                    소속: {selectedAuthor.affiliation}
                  </Typography>
                )}
              </Box>
              
              <Typography variant="h6" gutterBottom>
                논문 목록
              </Typography>
              
              {authorPapers.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  논문 정보를 불러올 수 없습니다.
                </Typography>
              ) : (
                <List>
                  {authorPapers.map((paper, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '1rem' }}>
                              {paper.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              {paper.journal && (
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: '0.85rem' }}>
                                  저널: {paper.journal}
                                </Typography>
                              )}
                              {paper.year && (
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: '0.85rem' }}>
                                  연도: {paper.year}
                                </Typography>
                              )}
                              {paper.authors && paper.authors.length > 0 && (
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: '0.85rem' }}>
                                  공동저자: {paper.authors.filter((author: string) => author !== selectedAuthor.author).join(', ')}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < authorPapers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setAuthorDetailsOpen(false)}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* Journal Details Dialog */}
      <Dialog
        open={journalDetailsOpen}
        onClose={() => setJournalDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { maxHeight: '90vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Book />
            {selectedJournal?.journal} 최근 논문
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedJournal && (
            <Box>
              <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  총 {selectedJournal.count}편의 논문
                </Typography>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                논문 목록 ({journalPapers.length}편)
              </Typography>
              
              {journalPapers.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  논문 정보를 불러올 수 없습니다.
                </Typography>
              ) : (
                <List>
                  {journalPapers.map((paper, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '1rem' }}>
                              {paper.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              {paper.authors && paper.authors.length > 0 && (
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: '0.85rem' }}>
                                  저자: {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}
                                </Typography>
                              )}
                              {paper.year && (
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: '0.85rem' }}>
                                  연도: {paper.year}
                                </Typography>
                              )}
                              {paper.abstract && (
                                <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.9rem' }}>
                                  {paper.abstract.length > 200 ? `${paper.abstract.substring(0, 200)}...` : paper.abstract}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < journalPapers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setJournalDetailsOpen(false)}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrendAnalysis;