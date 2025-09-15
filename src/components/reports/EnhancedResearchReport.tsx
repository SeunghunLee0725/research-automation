import React, { useState, useEffect } from 'react';
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
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Collapse,
  Switch,
  FormControlLabel,
  FormGroup,
  Tabs,
  Tab,
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
  Analytics,
  Speed,
  Insights,
  Timeline,
  BubbleChart,
  ShowChart,
  Info,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Refresh,
  Settings,
  ViewModule,
} from '@mui/icons-material';
import axios from 'axios';
import enhancedAnalysisService from '../../services/enhancedAnalysis';
import MultiStageAnalysisService from '../../services/multiStageAnalysis';

interface AnalysisConfig {
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  enableStatistics: boolean;
  enablePrediction: boolean;
  enableVisualization: boolean;
  multiStage: boolean;
  paperCount: number;
}

interface AnalysisStage {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: any;
  confidence?: number;
  duration?: number;
}

const EnhancedResearchReport: React.FC = () => {
  const [savedFiles, setSavedFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [experimentMethod, setExperimentMethod] = useState<string>('');
  const [experimentResults, setExperimentResults] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [filesLoading, setFilesLoading] = useState(true);
  
  // Enhanced features state
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>({
    analysisDepth: 'detailed',
    enableStatistics: true,
    enablePrediction: false,
    enableVisualization: false,
    multiStage: false,
    paperCount: 30
  });
  
  const [analysisStages, setAnalysisStages] = useState<AnalysisStage[]>([
    { name: 'Data Preparation', status: 'pending' },
    { name: 'Primary Analysis', status: 'pending' },
    { name: 'Comparative Analysis', status: 'pending' },
    { name: 'Statistical Validation', status: 'pending' },
    { name: 'Report Generation', status: 'pending' }
  ]);
  
  const [activeTab, setActiveTab] = useState(0);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState<number>(0);

  useEffect(() => {
    loadSavedFiles();
  }, []);

  const loadSavedFiles = async () => {
    try {
      setFilesLoading(true);
      const response = await axios.get('http://localhost:3001/api/saved-papers');
      if (response.data && response.data.files && Array.isArray(response.data.files)) {
        setSavedFiles(response.data.files);
      }
    } catch (error) {
      console.error('Error loading saved files:', error);
      setError('Failed to load files');
    } finally {
      setFilesLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !experimentMethod || !experimentResults) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysisResult(null);
    setConfidenceScore(0);

    try {
      // Update stages to processing
      setAnalysisStages(stages => stages.map((stage, index) => ({
        ...stage,
        status: index === 0 ? 'processing' : 'pending'
      })));

      // Stage 1: Data Preparation
      await simulateStageProcessing(0);
      
      // Stage 2: Primary Analysis
      await simulateStageProcessing(1);
      const primaryResponse = await performEnhancedAnalysis();
      
      // Stage 3: Comparative Analysis (if multi-stage enabled)
      if (analysisConfig.multiStage) {
        await simulateStageProcessing(2);
        // Additional comparative analysis logic here
      }
      
      // Stage 4: Statistical Validation (if enabled)
      if (analysisConfig.enableStatistics) {
        await simulateStageProcessing(3);
        // Statistical validation logic here
      }
      
      // Stage 5: Report Generation
      await simulateStageProcessing(4);
      
      setAnalysisResult(primaryResponse);
      setConfidenceScore(calculateConfidence(primaryResponse));
      
      // Mark all stages as completed
      setAnalysisStages(stages => stages.map(stage => ({
        ...stage,
        status: 'completed'
      })));
      
    } catch (error: any) {
      console.error('Analysis error:', error);
      setError(error.response?.data?.error || 'Analysis failed');
      
      // Mark current stage as error
      setAnalysisStages(stages => stages.map(stage => ({
        ...stage,
        status: stage.status === 'processing' ? 'error' : stage.status
      })));
    } finally {
      setLoading(false);
    }
  };

  const performEnhancedAnalysis = async () => {
    // Load paper data
    const paperResponse = await axios.get(`http://localhost:3001/api/saved-papers/${selectedFile}`);
    const papers = paperResponse.data.papers || [];
    
    // Generate enhanced prompt
    const enhancedPrompt = enhancedAnalysisService.generateEnhancedPrompt(
      { method: experimentMethod, results: experimentResults, notes: additionalNotes },
      papers.slice(0, analysisConfig.paperCount),
      {
        analysisDepth: analysisConfig.analysisDepth,
        includeDomainKnowledge: true,
        includeStatisticalAnalysis: analysisConfig.enableStatistics,
        includeVisualAnalysis: analysisConfig.enableVisualization,
        comparePapersCount: analysisConfig.paperCount
      }
    );
    
    // Call enhanced API endpoint
    const response = await axios.post('http://localhost:3001/api/enhanced-research-analysis', {
      selectedFile,
      userResearch: {
        method: experimentMethod,
        results: experimentResults,
        notes: additionalNotes
      },
      analysisConfig,
      enhancedPrompt
    });
    
    return response.data;
  };

  const simulateStageProcessing = async (stageIndex: number) => {
    setAnalysisStages(stages => stages.map((stage, index) => ({
      ...stage,
      status: index === stageIndex ? 'processing' : 
              index < stageIndex ? 'completed' : 
              stage.status
    })));
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const calculateConfidence = (result: any): number => {
    let score = 70; // Base score
    
    if (result.creativity?.score) score += 5;
    if (result.technicalExcellence?.score) score += 5;
    if (result.comparison) score += 5;
    if (result.futureDirections) score += 5;
    if (analysisConfig.enableStatistics) score += 5;
    if (analysisConfig.multiStage) score += 5;
    
    return Math.min(100, score);
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'processing':
        return <CircularProgress size={20} />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <Circle color="disabled" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'info';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment color="primary" fontSize="large" />
          Enhanced AI Research Analysis
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip
            icon={<Speed />}
            label={`Depth: ${analysisConfig.analysisDepth}`}
            color="primary"
            variant="outlined"
          />
          {confidenceScore > 0 && (
            <Chip
              icon={<Psychology />}
              label={`Confidence: ${confidenceScore}%`}
              color={getConfidenceColor(confidenceScore)}
            />
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel - Input & Configuration */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Analysis Configuration</Typography>
                <IconButton onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}>
                  <Settings />
                </IconButton>
              </Box>
              
              {/* Advanced Settings */}
              <Collapse in={showAdvancedSettings}>
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>Analysis Depth</Typography>
                  <ToggleButtonGroup
                    value={analysisConfig.analysisDepth}
                    exclusive
                    onChange={(e, value) => value && setAnalysisConfig({...analysisConfig, analysisDepth: value})}
                    size="small"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton value="basic">Basic</ToggleButton>
                    <ToggleButton value="detailed">Detailed</ToggleButton>
                    <ToggleButton value="comprehensive">Comprehensive</ToggleButton>
                  </ToggleButtonGroup>
                  
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={analysisConfig.enableStatistics}
                          onChange={(e) => setAnalysisConfig({...analysisConfig, enableStatistics: e.target.checked})}
                        />
                      }
                      label="Statistical Analysis"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={analysisConfig.enablePrediction}
                          onChange={(e) => setAnalysisConfig({...analysisConfig, enablePrediction: e.target.checked})}
                        />
                      }
                      label="Predictive Modeling"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={analysisConfig.multiStage}
                          onChange={(e) => setAnalysisConfig({...analysisConfig, multiStage: e.target.checked})}
                        />
                      }
                      label="Multi-Stage Analysis"
                    />
                  </FormGroup>
                  
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Papers to Analyze: {analysisConfig.paperCount}
                  </Typography>
                  <Slider
                    value={analysisConfig.paperCount}
                    onChange={(e, value) => setAnalysisConfig({...analysisConfig, paperCount: value as number})}
                    min={10}
                    max={50}
                    marks
                    step={10}
                    valueLabelDisplay="auto"
                  />
                </Paper>
              </Collapse>

              <Divider sx={{ mb: 2 }} />

              {/* File Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Paper Database</InputLabel>
                <Select
                  value={selectedFile}
                  label="Select Paper Database"
                  onChange={(e) => setSelectedFile(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select a file</em>
                  </MenuItem>
                  {savedFiles.map((file) => (
                    <MenuItem key={file.filename} value={file.filename}>
                      {file.filename} ({file.paperCount} papers)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Input Fields */}
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Experimental Method"
                value={experimentMethod}
                onChange={(e) => setExperimentMethod(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Results & Data"
                value={experimentResults}
                onChange={(e) => setExperimentResults(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Additional Notes (Optional)"
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
                startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
              >
                {loading ? 'Analyzing...' : 'Start Enhanced Analysis'}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Progress */}
          {(loading || analysisResult) && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Progress
                </Typography>
                <Stepper orientation="vertical" activeStep={analysisStages.findIndex(s => s.status === 'processing')}>
                  {analysisStages.map((stage, index) => (
                    <Step key={index} completed={stage.status === 'completed'}>
                      <StepLabel
                        StepIconComponent={() => getStageIcon(stage.status)}
                        error={stage.status === 'error'}
                      >
                        {stage.name}
                      </StepLabel>
                      {stage.confidence && (
                        <StepContent>
                          <Typography variant="caption">
                            Confidence: {stage.confidence}%
                          </Typography>
                        </StepContent>
                      )}
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Panel - Results */}
        <Grid item xs={12} md={7}>
          {analysisResult ? (
            <Card>
              <CardContent>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                  <Tab label="Overview" icon={<Assessment />} iconPosition="start" />
                  <Tab label="Detailed Analysis" icon={<Analytics />} iconPosition="start" />
                  <Tab label="Comparisons" icon={<CompareArrows />} iconPosition="start" />
                  <Tab label="Predictions" icon={<Timeline />} iconPosition="start" />
                </Tabs>

                {/* Tab Panels */}
                <Box hidden={activeTab !== 0}>
                  {/* Overview Tab Content */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {analysisResult.creativity?.score || 0}/10
                        </Typography>
                        <Typography variant="body2">Innovation Score</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {analysisResult.technicalExcellence?.score || 0}/10
                        </Typography>
                        <Typography variant="body2">Technical Merit</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Key Insights</Typography>
                        {analysisResult.keyInsights?.map((insight: string, index: number) => (
                          <Chip
                            key={index}
                            label={insight}
                            sx={{ m: 0.5 }}
                            icon={<Insights />}
                          />
                        ))}
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                <Box hidden={activeTab !== 1}>
                  {/* Detailed Analysis Tab */}
                  <Typography variant="body1">
                    {JSON.stringify(analysisResult, null, 2)}
                  </Typography>
                </Box>

                <Box hidden={activeTab !== 2}>
                  {/* Comparisons Tab */}
                  <Typography variant="h6">Comparative Analysis</Typography>
                  {analysisResult.comparison && (
                    <Box>
                      {/* Comparison content */}
                    </Box>
                  )}
                </Box>

                <Box hidden={activeTab !== 3}>
                  {/* Predictions Tab */}
                  <Typography variant="h6">Future Predictions</Typography>
                  {analysisResult.predictions && (
                    <Box>
                      {/* Prediction content */}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
              <Science sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Enhanced AI Analysis Results
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure your analysis parameters and start the enhanced analysis
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

// Helper component for empty circle icon
const Circle: React.FC<{ color: string }> = ({ color }) => (
  <Box
    sx={{
      width: 20,
      height: 20,
      borderRadius: '50%',
      border: '2px solid',
      borderColor: color === 'disabled' ? 'action.disabled' : color,
    }}
  />
);

// Slider component
const Slider = (props: any) => (
  <Box sx={{ px: 1 }}>
    <input
      type="range"
      {...props}
      style={{ width: '100%' }}
    />
  </Box>
);

export default EnhancedResearchReport;