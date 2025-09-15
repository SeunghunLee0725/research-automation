import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Link,
  Divider,
  TextField,
  InputAdornment,
  Checkbox,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  OpenInNew,
  Visibility,
  Search,
  Save,
  SelectAll,
  ClearAll,
  AutoAwesome,
  School,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useApp } from '../../contexts/AppContext';
import { Paper } from '../../types';

const PaperList: React.FC = () => {
  const { papers } = useApp();
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  
  // Debug: Log papers when component renders
  React.useEffect(() => {
    console.log('PaperList received papers:', papers.length, papers);
  }, [papers]);

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSource = true; // filterSource removed
    
    return matchesSearch && matchesSource;
  }).sort((a, b) => {
    // Sort by citations (higher citations first)
    if (a.citations && b.citations) {
      return b.citations - a.citations;
    }
    
    // If one has citations and other doesn't, prioritize the one with citations
    if (a.citations && !b.citations) return -1;
    if (!a.citations && b.citations) return 1;
    
    // Finally, sort by publication date (newer first)
    return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
  });

  const handleViewDetails = (paper: Paper) => {
    setSelectedPaper(paper);
  };

  const handleCloseDialog = () => {
    setSelectedPaper(null);
  };
  
  const handleToggleSelect = (paperId: string) => {
    const newSelected = new Set(selectedPapers);
    if (newSelected.has(paperId)) {
      newSelected.delete(paperId);
    } else {
      newSelected.add(paperId);
    }
    setSelectedPapers(newSelected);
  };
  
  const handleSelectAll = () => {
    const allPaperIds = new Set(filteredPapers.map(p => p.id));
    setSelectedPapers(allPaperIds);
  };
  
  const handleDeselectAll = () => {
    setSelectedPapers(new Set());
  };
  
  const handleAnalyze = async (paper: Paper) => {
    setAnalyzing(paper.id);
    try {
      console.log('Analyzing paper:', paper.title);
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: paper.title,
          abstract: paper.abstract,
          journal: paper.journal,
        }),
      });
      
      if (response.ok) {
        const analysisData = await response.json();
        console.log('Analysis received:', analysisData);
        setAnalysis({ ...analysisData, paperId: paper.id });
        setSelectedPaper(paper);
      } else {
        const errorData = await response.json();
        console.error('Failed to analyze paper:', response.status, errorData);
        alert(`Failed to analyze paper: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error analyzing paper:', error);
      alert(`Error analyzing paper: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAnalyzing(null);
    }
  };
  
  
  const handleSaveSelected = async (overwrite = false) => {
    const papersToSave = papers.filter(p => selectedPapers.has(p.id));
    
    console.log('Saving papers:', papersToSave.length, 'papers selected');
    console.log('Papers to save:', papersToSave);
    console.log('First paper:', papersToSave[0]);
    
    // 순환 참조 체크
    papersToSave.forEach((paper, index) => {
      try {
        JSON.stringify(paper);
      } catch (e) {
        console.error(`Paper at index ${index} has circular reference:`, paper);
        console.error('Error:', e);
      }
    });
    
    if (papersToSave.length === 0) {
      alert('Please select at least one paper to save');
      return;
    }
    
    // localStorage에서 검색 정보 가져오기
    const searchInfo = {
      query: localStorage.getItem('lastSearchQuery') || '',
      sources: JSON.parse(localStorage.getItem('searchSources') || '[]'),
      yearFrom: localStorage.getItem('yearFrom') || null,
      yearTo: localStorage.getItem('yearTo') || null,
      maxResults: localStorage.getItem('maxResults') || null,
      includeKeywords: JSON.parse(localStorage.getItem('includeKeywords') || '[]'),
      excludeKeywords: JSON.parse(localStorage.getItem('excludeKeywords') || '[]')
    };
    
    try {
      // 안전한 방법으로 papers 데이터 복사
      const cleanPapers = papersToSave.map(paper => {
        try {
          // 먼저 JSON으로 변환 가능한지 테스트
          const testString = JSON.stringify(paper);
          return JSON.parse(testString);
        } catch (e) {
          // JSON 변환 실패시 필요한 필드만 수동으로 복사
          return {
            id: paper.id,
            title: paper.title,
            authors: Array.isArray(paper.authors) ? [...paper.authors] : [],
            abstract: paper.abstract,
            publicationDate: paper.publicationDate,
            source: paper.source,
            url: paper.url,
            keywords: Array.isArray(paper.keywords) ? [...paper.keywords] : [],
            plasmaType: paper.plasmaType,
            parameters: paper.parameters ? {...paper.parameters} : undefined,
            citations: paper.citations,
            doi: paper.doi,
            journal: paper.journal,
            quartile: paper.quartile,
            impactFactor: paper.impactFactor,
            patentNumber: paper.patentNumber,
            impact_factor: paper.impact_factor,
            journal_percentage: paper.journal_percentage,
            journal_category: paper.journal_category,
            journal_rank: paper.journal_rank
          };
        }
      });
      
      // Backend API에 저장 요청
      const response = await fetch('http://localhost:3001/api/papers/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          papers: cleanPapers,
          searchInfo: searchInfo,
          overwrite: overwrite 
        }),
      });
      
      const result = await response.json();
      
      // Check if overwrite confirmation is required
      if (result.requiresConfirmation) {
        const confirmOverwrite = window.confirm(result.message);
        if (confirmOverwrite) {
          // Retry with overwrite flag
          handleSaveSelected(true);
        }
        return;
      }
      
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        console.log('Save result:', result);
        
        let message = '';
        if (result.count > 0) {
          message = `Successfully saved ${result.count} new papers`;
          if (result.duplicatesSkipped > 0) {
            message += ` (${result.duplicatesSkipped} duplicates skipped)`;
          }
          if (result.filename) {
            message += `\nFile: ${result.filename}`;
          }
        } else {
          message = `All ${papersToSave.length} papers already exist in database`;
        }
        
        alert(message);
        // Clear selection after successful save
        setSelectedPapers(new Set());
      } else {
        console.error('Failed to save papers:', result);
        alert('Failed to save papers: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving papers:', error);
      alert('Error saving papers. Please check if the server is running on port 3001.');
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'google_scholar':
        return 'primary';
      case 'pubmed':
        return 'secondary';
      case 'patent':
        return 'warning';
      default:
        return 'default';
    }
  };
  

  return (
    <Card>
      <CardContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'stretch', md: 'center' }, 
          mb: 2,
          gap: 2
        }}>
          <Typography variant="h5" sx={{ mb: { xs: 1, md: 0 } }}>
            Collected Data ({filteredPapers.length})
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            flexWrap: 'wrap',
            justifyContent: { xs: 'stretch', sm: 'flex-start', md: 'flex-end' },
            '& > button': {
              flex: { xs: '1 1 100%', sm: '0 0 auto', md: '0 0 auto' },
              minWidth: { xs: '100%', sm: 'auto', md: 'auto' }
            }
          }}>
            <Button
              size="small"
              startIcon={<SelectAll />}
              onClick={handleSelectAll}
              disabled={filteredPapers.length === 0}
            >
              Select All
            </Button>
            <Button
              size="small"
              startIcon={<ClearAll />}
              onClick={handleDeselectAll}
              disabled={selectedPapers.size === 0}
            >
              Deselect All
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Save />}
              onClick={() => handleSaveSelected()}
              disabled={selectedPapers.size === 0}
            >
              Save ({selectedPapers.size})
            </Button>
          </Box>
        </Box>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Papers saved successfully to database!
          </Alert>
        )}
        
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search papers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <List>
          {filteredPapers.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography color="textSecondary">
                    No papers collected yet. Use the Paper Collector to search for papers.
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            filteredPapers.map((paper) => (
              <React.Fragment key={paper.id}>
                <ListItem
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'flex-start', md: 'center' }
                  }}
                >
                  <Checkbox
                    checked={selectedPapers.has(paper.id)}
                    onChange={() => handleToggleSelect(paper.id)}
                    sx={{ mr: 1, alignSelf: { xs: 'flex-start', sm: 'center' } }}
                  />
                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant="subtitle1" component="div">
                          {paper.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                          <Chip
                            label={paper.source}
                            size="small"
                            color={getSourceColor(paper.source)}
                          />
                          {paper.journal && (
                            <Chip
                              icon={<School />}
                              label={paper.journal}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                maxWidth: 'none',
                                '& .MuiChip-label': {
                                  overflow: 'visible',
                                  textOverflow: 'unset',
                                  whiteSpace: 'normal'
                                }
                              }}
                            />
                          )}
                          {paper.impact_factor && 
                           typeof paper.impact_factor === 'number' && 
                           paper.impact_factor > 0 && (
                            <Chip
                              label={`IF: ${paper.impact_factor}`}
                              size="small"
                              color="success"
                              variant="filled"
                            />
                          )}
                          {paper.journal_percentage && 
                           typeof paper.journal_percentage === 'string' && 
                           paper.journal_percentage.trim() !== '' &&
                           paper.journal_percentage !== 'N/A' && (
                            <Chip
                              label={`상위 ${paper.journal_percentage}`}
                              size="small"
                              color="info"
                              variant="filled"
                            />
                          )}
                          {paper.journal_rank && paper.journal_rank > 0 && (
                            <Chip
                              label={`Rank: ${paper.journal_rank}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {paper.citations && (
                            <Chip
                              label={`${paper.citations} citations`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          <Chip
                            label={format(new Date(paper.publicationDate), 'MMM yyyy')}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {paper.authors.join(', ')}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {paper.abstract}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1,
                    ml: { xs: 0, sm: 0, md: 'auto' },
                    mt: { xs: 1, sm: 1, md: 0 },
                    width: { xs: '100%', sm: '100%', md: 'auto' },
                    justifyContent: { xs: 'flex-end', sm: 'flex-end', md: 'flex-start' }
                  }}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(paper)}
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => window.open(paper.url, '_blank')}
                      title="Open Original"
                    >
                      <OpenInNew />
                    </IconButton>
                    <IconButton
                      size="small"
                      title="Analyze with AI"
                      onClick={() => handleAnalyze(paper)}
                      disabled={analyzing === paper.id}
                    >
                      {analyzing === paper.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <AutoAwesome />
                      )}
                    </IconButton>
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>

        {/* Paper Details Dialog */}
        <Dialog
          open={!!selectedPaper}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedPaper && (
            <>
              <DialogTitle>{selectedPaper.title}</DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Authors
                  </Typography>
                  <Typography>{selectedPaper.authors.join(', ')}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Publication Date
                  </Typography>
                  <Typography>
                    {format(new Date(selectedPaper.publicationDate), 'MMMM d, yyyy')}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Source
                  </Typography>
                  <Chip
                    label={selectedPaper.source}
                    color={getSourceColor(selectedPaper.source)}
                    size="small"
                  />
                </Box>

                {selectedPaper.citations && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Citations
                    </Typography>
                    <Typography>{selectedPaper.citations}</Typography>
                  </Box>
                )}

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Abstract
                  </Typography>
                  <Typography>{selectedPaper.abstract}</Typography>
                </Box>
                
                {analysis && analysis.paperId === selectedPaper.id && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      AI 분석 결과 (Perplexity)
                    </Typography>
                    {analysis.summary && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">요약:</Typography>
                        <Typography variant="body2">{analysis.summary}</Typography>
                      </Box>
                    )}
                    {analysis.keyFindings && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">주요 발견사항:</Typography>
                        <Typography variant="body2">{analysis.keyFindings}</Typography>
                      </Box>
                    )}
                    {analysis.methodology && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">연구 방법론:</Typography>
                        <Typography variant="body2">{analysis.methodology}</Typography>
                      </Box>
                    )}
                    {analysis.applications && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">잠재적 응용 분야:</Typography>
                        <Typography variant="body2">{analysis.applications}</Typography>
                      </Box>
                    )}
                    {analysis.relatedAreas && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">관련 연구 분야:</Typography>
                        <Typography variant="body2">{analysis.relatedAreas}</Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {selectedPaper.keywords.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Keywords
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {selectedPaper.keywords.map((keyword, index) => (
                        <Chip key={index} label={keyword} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    URL
                  </Typography>
                  <Link href={selectedPaper.url} target="_blank" rel="noopener">
                    {selectedPaper.url}
                  </Link>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
                <Button
                  variant="contained"
                  onClick={() => window.open(selectedPaper.url, '_blank')}
                  startIcon={<OpenInNew />}
                >
                  Open Original
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PaperList;