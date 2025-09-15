import { apiEndpoints } from '../../config/api';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  TextField,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore,
  Description,
  Save as SaveIcon,
  FolderOpen,
  AutoAwesome,
  Science,
  Edit,
  Delete,
  ContentCopy,
  Download,
  Refresh,
} from '@mui/icons-material';
import axios from 'axios';

interface AnalysisResult {
  id: string;
  result: any;
  timestamp?: string;
  papers?: any[];
}

interface PaperPlan {
  id: string;
  analysisId?: string;
  title: string;
  abstract: string;
  introduction: string;
  methodology: string[];
  expectedResults: string[];
  discussionPoints: string[];
  conclusions: string[];
  experimentalDesign: {
    experiments: string[];
    controls: string[];
    metrics: string[];
  };
  timestamp: string;
}

interface SavedIntroduction {
  id: string;
  analysisId: string;
  introduction: string;
  references?: string;
  suggestedTitle?: string;
  suggestedKeywords?: string[];
  timestamp: string;
}

const Paperwork: React.FC = () => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');
  const [availableAnalyses, setAvailableAnalyses] = useState<AnalysisResult[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [introduction, setIntroduction] = useState<string>('');
  const [references, setReferences] = useState<string>('');
  const [suggestedTitle, setSuggestedTitle] = useState<string>('');
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [savedIntroductions, setSavedIntroductions] = useState<SavedIntroduction[]>([]);
  const [paperPlans, setPaperPlans] = useState<PaperPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<PaperPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIntro, setEditingIntro] = useState(false);

  // Load available analyses
  useEffect(() => {
    loadAvailableAnalyses();
    loadSavedPaperPlans();
    loadSavedIntroductions();
  }, []);

  const loadAvailableAnalyses = async () => {
    try {
      const response = await axios.get(apiEndpoints.analysisResults);
      if (response.data && Array.isArray(response.data)) {
        setAvailableAnalyses(response.data);
      }
    } catch (error) {
      console.error('Failed to load analyses:', error);
      setError('Failed to load available analyses');
    }
  };

  const loadSavedPaperPlans = async () => {
    try {
      const response = await axios.get(apiEndpoints.paperPlans);
      if (response.data && Array.isArray(response.data)) {
        setPaperPlans(response.data);
      }
    } catch (error) {
      console.error('Failed to load paper plans:', error);
    }
  };

  const loadSavedIntroductions = async () => {
    try {
      const response = await axios.get(apiEndpoints.savedIntroductions);
      if (response.data && Array.isArray(response.data)) {
        setSavedIntroductions(response.data);
      }
    } catch (error) {
      console.error('Failed to load saved introductions:', error);
    }
  };

  const handleAnalysisSelect = async (event: SelectChangeEvent) => {
    const analysisId = event.target.value;
    setSelectedAnalysis(analysisId);
    
    if (analysisId) {
      setLoading(true);
      try {
        const response = await axios.get(apiEndpoints.getAnalysisResult(analysisId));
        setAnalysisData(response.data);
        setError(null);
        
        // Load papers from the selected file
        if (response.data.metadata?.selectedFile) {
          try {
            const papersResponse = await axios.get(apiEndpoints.getSavedPapersFile(response.data.metadata.selectedFile));
            if (papersResponse.data && papersResponse.data.papers) {
              // Store papers in analysisData for later use
              response.data.papers = papersResponse.data.papers;
              setAnalysisData(response.data);
              
              // Auto-generate references from papers
              const formattedRefs = papersResponse.data.papers.slice(0, 50).map((paper: any, idx: number) => {
                const authors = paper.authors?.length > 3 
                  ? `${paper.authors.slice(0, 3).join(', ')}, et al.`
                  : paper.authors?.join(', ') || 'Unknown';
                return `[${idx + 1}] ${authors}. ${paper.title}. ${paper.journal || paper.source || 'Unknown'}, ${paper.year || 'N/A'}.`;
              }).join('\n\n');
              setReferences(formattedRefs);
            }
          } catch (paperError) {
            console.error('Failed to load papers:', paperError);
          }
        }
      } catch (error) {
        console.error('Failed to load analysis:', error);
        setError('Failed to load selected analysis');
      } finally {
        setLoading(false);
      }
    }
  };

  const generateIntroduction = async () => {
    if (!analysisData) {
      setError('Please select an analysis first');
      return;
    }

    setGenerating(true);
    setError(null);
    
    try {
      const response = await axios.post(apiEndpoints.paperworkGenerateIntroduction, {
        analysisData: analysisData.result,
        papers: analysisData.papers || []
      });
      
      console.log('Introduction response:', response.data);
      
      setIntroduction(response.data.introduction || '');
      setReferences(response.data.references || '');
      setSuggestedTitle(response.data.suggestedTitle || '');
      setSuggestedKeywords(response.data.suggestedKeywords || []);
      setEditingIntro(false);
      
      // If references are empty, try to generate them from papers
      if (!response.data.references && analysisData.papers && analysisData.papers.length > 0) {
        const formattedRefs = analysisData.papers.slice(0, 30).map((paper, idx) => {
          const authors = paper.authors?.length > 3 
            ? `${paper.authors.slice(0, 3).join(', ')}, et al.`
            : paper.authors?.join(', ') || 'Unknown';
          return `[${idx + 1}] ${authors}. ${paper.title}. ${paper.journal || paper.source || 'Unknown'}, ${paper.year || 'N/A'}.`;
        }).join('\n\n');
        setReferences(formattedRefs);
      }
    } catch (error) {
      console.error('Failed to generate introduction:', error);
      setError('Failed to generate introduction. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const saveIntroduction = async () => {
    if (!introduction || !selectedAnalysis) {
      setError('No introduction to save');
      return;
    }

    try {
      const savedIntro = {
        id: `intro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        analysisId: selectedAnalysis,
        introduction: introduction,
        references: references,
        suggestedTitle: suggestedTitle,
        suggestedKeywords: suggestedKeywords,
        timestamp: new Date().toISOString()
      };
      
      await axios.post(apiEndpoints.saveIntroduction, savedIntro);
      
      setSavedIntroductions([...savedIntroductions, savedIntro]);
      setError(null);
      alert('Introduction saved successfully!');
    } catch (error) {
      console.error('Failed to save introduction:', error);
      setError('Failed to save introduction');
    }
  };

  const loadIntroduction = (savedIntro: SavedIntroduction) => {
    setIntroduction(savedIntro.introduction);
    setReferences(savedIntro.references || '');
    setSuggestedTitle(savedIntro.suggestedTitle || '');
    setSuggestedKeywords(savedIntro.suggestedKeywords || []);
    setSelectedAnalysis(savedIntro.analysisId);
  };

  const deleteIntroduction = async (introId: string) => {
    if (!window.confirm('Are you sure you want to delete this introduction?')) return;

    try {
      await axios.delete(apiEndpoints.getIntroduction(introId));
      setSavedIntroductions(savedIntroductions.filter(i => i.id !== introId));
    } catch (error) {
      console.error('Failed to delete introduction:', error);
      setError('Failed to delete introduction');
    }
  };

  const generatePaperPlan = async () => {
    if (!analysisData) {
      setError('Please select an analysis first');
      return;
    }

    setGenerating(true);
    setError(null);
    
    try {
      const response = await axios.post(apiEndpoints.generatePaperPlan, {
        analysisData: analysisData.result,
        papers: analysisData.papers || [],
        introduction: introduction
      });
      
      const newPlan: PaperPlan = {
        ...response.data,
        id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        analysisId: selectedAnalysis,
        timestamp: new Date().toISOString()
      };
      
      setCurrentPlan(newPlan);
      setOpenDialog(true);
    } catch (error) {
      console.error('Failed to generate paper plan:', error);
      setError('Failed to generate paper plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const savePaperPlan = async () => {
    if (!currentPlan) return;

    try {
      const planToSave = {
        ...currentPlan,
        analysisId: currentPlan.analysisId || selectedAnalysis
      };
      await axios.post(apiEndpoints.savePaperPlan, planToSave);
      
      setPaperPlans([...paperPlans, currentPlan]);
      setOpenDialog(false);
      setError(null);
      alert('Paper plan saved successfully!');
    } catch (error) {
      console.error('Failed to save paper plan:', error);
      setError('Failed to save paper plan');
    }
  };

  const loadPaperPlan = (plan: PaperPlan) => {
    setCurrentPlan(plan);
    setOpenDialog(true);
  };

  const deletePaperPlan = async (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this paper plan?')) return;

    try {
      await axios.delete(apiEndpoints.deletePaperPlan(planId));
      setPaperPlans(paperPlans.filter(p => p.id !== planId));
    } catch (error) {
      console.error('Failed to delete paper plan:', error);
      setError('Failed to delete paper plan');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Description fontSize="large" />
        Paperwork
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Analysis Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Analysis
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Choose an analysis result</InputLabel>
            <Select
              value={selectedAnalysis}
              onChange={handleAnalysisSelect}
              label="Choose an analysis result"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {availableAnalyses.map((analysis) => (
                <MenuItem key={analysis.id} value={analysis.id}>
                  {analysis.id} {analysis.timestamp && `- ${new Date(analysis.timestamp).toLocaleDateString()}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {loading && <CircularProgress />}
          
          {analysisData && (
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Analysis loaded: {analysisData.id}
              </Typography>
              {analysisData.papers && (
                <Typography variant="body2" color="text.secondary">
                  Papers included: {analysisData.papers.length}
                </Typography>
              )}
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Introduction Section */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Paper Introduction</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {introduction ? (
              <Box>
                {/* Suggested Title and Keywords */}
                {(suggestedTitle || suggestedKeywords.length > 0) && (
                  <Paper sx={{ p: 2, mb: 2, bgcolor: '#e3f2fd' }}>
                    {suggestedTitle && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Suggested Title:
                        </Typography>
                        <Typography variant="body2">{suggestedTitle}</Typography>
                      </Box>
                    )}
                    {suggestedKeywords.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                          Suggested Keywords:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {suggestedKeywords.map((keyword, index) => (
                            <Chip key={index} label={keyword} size="small" color="primary" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Generated Introduction:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <IconButton size="small" onClick={() => setEditingIntro(!editingIntro)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => copyToClipboard(introduction)}>
                      <ContentCopy />
                    </IconButton>
                  </Box>
                </Box>
                
                {editingIntro ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={15}
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                    variant="outlined"
                  />
                ) : (
                  <Paper sx={{ p: 2, bgcolor: 'background.default', maxHeight: 400, overflow: 'auto' }}>
                    <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                      {introduction}
                    </Typography>
                  </Paper>
                )}

                {/* Suggested Title and Keywords */}
                {(suggestedTitle || suggestedKeywords?.length > 0) && (
                  <Box sx={{ mt: 2 }}>
                    {suggestedTitle && (
                      <Paper sx={{ p: 2, mb: 2, bgcolor: 'blue.50' }}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                          Suggested Title:
                        </Typography>
                        <Typography variant="body1">
                          {suggestedTitle}
                        </Typography>
                      </Paper>
                    )}
                    
                    {suggestedKeywords && suggestedKeywords.length > 0 && (
                      <Paper sx={{ p: 2, bgcolor: 'green.50' }}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                          Keywords:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {suggestedKeywords.map((keyword, idx) => (
                            <Chip
                              key={idx}
                              label={keyword}
                              variant="outlined"
                              color="primary"
                            />
                          ))}
                        </Box>
                      </Paper>
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No introduction generated yet. Select an analysis and click generate.
              </Typography>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<AutoAwesome />}
                onClick={generateIntroduction}
                disabled={!selectedAnalysis || generating}
              >
                {generating ? 'Generating...' : 'Generate Introduction'}
              </Button>
              
              {introduction && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={saveIntroduction}
                  >
                    Save Introduction
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={generateIntroduction}
                  >
                    Regenerate
                  </Button>
                </>
              )}
            </Box>

            {/* Saved Introductions for Selected Analysis */}
            {selectedAnalysis && (() => {
              const filteredIntroductions = savedIntroductions.filter(
                intro => intro.analysisId === selectedAnalysis
              );
              
              return filteredIntroductions.length > 0 ? (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Saved Introductions for This Analysis ({filteredIntroductions.length}):
                  </Typography>
                  <Grid container spacing={2}>
                    {filteredIntroductions.map((savedIntro) => (
                      <Grid item xs={12} md={6} key={savedIntro.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                              {savedIntro.suggestedTitle || savedIntro.id}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              Saved: {new Date(savedIntro.timestamp).toLocaleString()}
                            </Typography>
                            {savedIntro.suggestedKeywords && savedIntro.suggestedKeywords.length > 0 && (
                              <Box sx={{ mb: 1 }}>
                                {savedIntro.suggestedKeywords.slice(0, 3).map((keyword, idx) => (
                                  <Chip
                                    key={idx}
                                    label={keyword}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<FolderOpen />}
                                onClick={() => loadIntroduction(savedIntro)}
                              >
                                Load
                              </Button>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => deleteIntroduction(savedIntro.id)}
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : null;
            })()}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* References Section */}
      <Accordion defaultExpanded sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">References</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {references ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {references.split('\n').filter(line => line.trim()).length} references available
                  </Typography>
                  <IconButton size="small" onClick={() => copyToClipboard(references)}>
                    <ContentCopy />
                  </IconButton>
                </Box>
                <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}>
                  <Typography variant="body2" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {references}
                  </Typography>
                </Paper>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No references available. Generate an introduction to populate references.
                </Typography>
                {analysisData?.papers && analysisData.papers.length > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<AutoAwesome />}
                    onClick={() => {
                      const formattedRefs = analysisData.papers.slice(0, 50).map((paper, idx) => {
                        const authors = paper.authors?.length > 3 
                          ? `${paper.authors.slice(0, 3).join(', ')}, et al.`
                          : paper.authors?.join(', ') || 'Unknown';
                        return `[${idx + 1}] ${authors}. ${paper.title}. ${paper.journal || paper.source || 'Unknown'}, ${paper.year || 'N/A'}.`;
                      }).join('\n\n');
                      setReferences(formattedRefs);
                    }}
                  >
                    Generate References from Papers
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Paper Planning Section */}
      <Accordion defaultExpanded sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Paper Planning</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Generate a comprehensive paper plan including story, methodology, and expected results based on your analysis.
            </Typography>
            
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Science />}
              onClick={generatePaperPlan}
              disabled={!selectedAnalysis || generating}
              sx={{ mb: 3 }}
            >
              {generating ? 'Generating Paper Plan...' : 'Generate Paper Plan'}
            </Button>

            {/* Saved Paper Plans for Selected Analysis */}
            {selectedAnalysis && (() => {
              const filteredPlans = paperPlans.filter(
                plan => plan.analysisId === selectedAnalysis
              );
              
              return filteredPlans.length > 0 ? (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Saved Paper Plans for This Analysis ({filteredPlans.length}):
                </Typography>
                <Grid container spacing={2}>
                  {filteredPlans.map((plan) => (
                    <Grid item xs={12} md={6} key={plan.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {plan.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Created: {new Date(plan.timestamp).toLocaleDateString()}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={<FolderOpen />}
                              onClick={() => loadPaperPlan(plan)}
                            >
                              View
                            </Button>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => deletePaperPlan(plan.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : null;
            })()}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Paper Plan Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Paper Plan
          {currentPlan && (
            <IconButton
              size="small"
              onClick={() => copyToClipboard(JSON.stringify(currentPlan, null, 2))}
              sx={{ float: 'right' }}
            >
              <ContentCopy />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          {currentPlan && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {currentPlan.title}
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 2 }}>Abstract</Typography>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body1">{currentPlan.abstract}</Typography>
              </Paper>

              <Typography variant="h6">Introduction Outline</Typography>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body1">{currentPlan.introduction}</Typography>
              </Paper>

              <Typography variant="h6">Methodology</Typography>
              <List dense>
                {currentPlan.methodology.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`${index + 1}. ${item}`} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6">Expected Results</Typography>
              <List dense>
                {currentPlan.expectedResults.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`• ${item}`} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6">Experimental Design</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Experiments:</Typography>
                  <List dense>
                    {currentPlan.experimentalDesign.experiments.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`• ${item}`} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Controls:</Typography>
                  <List dense>
                    {currentPlan.experimentalDesign.controls.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`• ${item}`} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Metrics:</Typography>
                  <List dense>
                    {currentPlan.experimentalDesign.metrics.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`• ${item}`} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 2 }}>Discussion Points</Typography>
              <List dense>
                {currentPlan.discussionPoints.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`• ${item}`} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6">Conclusions</Typography>
              <List dense>
                {currentPlan.conclusions.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`${index + 1}. ${item}`} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {currentPlan && !paperPlans.find(p => p.id === currentPlan.id) && (
            <Button onClick={savePaperPlan} variant="contained" startIcon={<SaveIcon />}>
              Save Plan
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Paperwork;