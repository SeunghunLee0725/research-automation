import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Button,
  Alert,
  Paper,
  Divider,
  CircularProgress,
  Snackbar,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  ThermostatAuto,
  Analytics,
  Article,
  Info,
  Key as KeyIcon,
  Visibility,
  VisibilityOff,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface TemperatureSettings {
  mainAnalysis: number;
  enhancedAnalysis: number;
  introductionGeneration: number;
}

const Settings: React.FC = () => {
  const [temperatures, setTemperatures] = useState<TemperatureSettings>({
    mainAnalysis: 0.2,
    enhancedAnalysis: 0.3,
    introductionGeneration: 0.4,
  });
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Load temperature settings
      const tempResponse = await axios.get('http://localhost:3001/api/settings/temperature');
      if (tempResponse.data) {
        setTemperatures(tempResponse.data);
      }
      
      // Load API key status
      const apiKeyResponse = await axios.get('http://localhost:3001/api/settings/api-key-status');
      if (apiKeyResponse.data) {
        setHasApiKey(apiKeyResponse.data.hasKey);
        if (apiKeyResponse.data.maskedKey) {
          setApiKey(apiKeyResponse.data.maskedKey);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Use default values if no settings are saved
    } finally {
      setLoading(false);
    }
  };

  const handleTemperatureChange = (key: keyof TemperatureSettings) => (
    event: Event,
    value: number | number[]
  ) => {
    setTemperatures({
      ...temperatures,
      [key]: value as number,
    });
  };

  const saveApiKey = async () => {
    try {
      setSaving(true);
      await axios.post('http://localhost:3001/api/settings/api-key', { apiKey });
      setHasApiKey(true);
      setSnackbar({
        open: true,
        message: 'API 키가 저장되었습니다.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to save API key:', error);
      setSnackbar({
        open: true,
        message: 'API 키 저장에 실패했습니다.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteApiKey = async () => {
    try {
      setSaving(true);
      await axios.delete('http://localhost:3001/api/settings/api-key');
      setApiKey('');
      setHasApiKey(false);
      setSnackbar({
        open: true,
        message: 'API 키가 삭제되었습니다.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to delete API key:', error);
      setSnackbar({
        open: true,
        message: 'API 키 삭제에 실패했습니다.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await axios.post('http://localhost:3001/api/settings/temperature', temperatures);
      setSnackbar({
        open: true,
        message: 'Temperature 설정이 저장되었습니다.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSnackbar({
        open: true,
        message: '설정 저장에 실패했습니다.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setTemperatures({
      mainAnalysis: 0.2,
      enhancedAnalysis: 0.3,
      introductionGeneration: 0.4,
    });
  };

  const getTemperatureDescription = (value: number) => {
    if (value <= 0.2) return '매우 보수적 (일관된 결과)';
    if (value <= 0.4) return '보수적 (안정적인 결과)';
    if (value <= 0.6) return '균형적 (적절한 다양성)';
    if (value <= 0.8) return '창의적 (다양한 결과)';
    return '매우 창의적 (예측 어려움)';
  };

  const getTemperatureColor = (value: number) => {
    if (value <= 0.3) return '#2196F3'; // Blue
    if (value <= 0.5) return '#4CAF50'; // Green
    if (value <= 0.7) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon fontSize="large" />
        설정
      </Typography>

      {/* API Key Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <KeyIcon color="primary" />
            <Typography variant="h6">Perplexity API 키</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Perplexity API 키를 입력하면 해당 키로 AI 분석이 실행됩니다. 
            키가 없으면 기본 설정이 사용됩니다.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              type={showApiKey ? 'text' : 'password'}
              label="API 키"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasApiKey ? '저장된 키가 있습니다' : 'sk-...'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowApiKey(!showApiKey)}
                      edge="end"
                    >
                      {showApiKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText={hasApiKey ? '새 키를 입력하면 기존 키가 교체됩니다' : ''}
            />
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveApiKey}
              disabled={!apiKey || saving}
            >
              저장
            </Button>
            {hasApiKey && (
              <IconButton
                color="error"
                onClick={() => {
                  if (window.confirm('저장된 API 키를 삭제하시겠습니까?')) {
                    deleteApiKey();
                  }
                }}
                disabled={saving}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
          
          {hasApiKey && (
            <Alert severity="success" sx={{ mt: 2 }}>
              API 키가 설정되어 있습니다. 모든 AI 분석에 이 키가 사용됩니다.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
        <ThermostatAuto />
        AI Temperature 설정
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Temperature는 AI 모델의 창의성을 조절합니다. 낮은 값(0.1~0.3)은 일관되고 예측 가능한 결과를,
          높은 값(0.7~1.0)은 더 창의적이지만 예측하기 어려운 결과를 생성합니다.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Main Analysis Temperature */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Analytics color="primary" />
                <Typography variant="h6">메인 AI 분석</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                논문 데이터를 분석할 때 사용되는 temperature 설정
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h4" sx={{ color: getTemperatureColor(temperatures.mainAnalysis), mb: 1 }}>
                  {temperatures.mainAnalysis.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getTemperatureDescription(temperatures.mainAnalysis)}
                </Typography>
              </Paper>

              <Slider
                value={temperatures.mainAnalysis}
                onChange={handleTemperatureChange('mainAnalysis')}
                min={0.1}
                max={1.0}
                step={0.1}
                marks
                valueLabelDisplay="auto"
                sx={{ mt: 3 }}
              />
              
              <Typography variant="caption" color="text.secondary">
                권장값: 0.1 ~ 0.3 (정확한 분석을 위해)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Enhanced Analysis Temperature */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ThermostatAuto color="primary" />
                <Typography variant="h6">향상된 분석</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                심층 분석 및 통찰력 도출 시 사용되는 temperature 설정
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h4" sx={{ color: getTemperatureColor(temperatures.enhancedAnalysis), mb: 1 }}>
                  {temperatures.enhancedAnalysis.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getTemperatureDescription(temperatures.enhancedAnalysis)}
                </Typography>
              </Paper>

              <Slider
                value={temperatures.enhancedAnalysis}
                onChange={handleTemperatureChange('enhancedAnalysis')}
                min={0.1}
                max={1.0}
                step={0.1}
                marks
                valueLabelDisplay="auto"
                sx={{ mt: 3 }}
              />
              
              <Typography variant="caption" color="text.secondary">
                권장값: 0.3 ~ 0.5 (균형적인 분석을 위해)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Introduction Generation Temperature */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Article color="primary" />
                <Typography variant="h6">Introduction 생성</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                논문 Introduction 작성 시 사용되는 temperature 설정
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h4" sx={{ color: getTemperatureColor(temperatures.introductionGeneration), mb: 1 }}>
                  {temperatures.introductionGeneration.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getTemperatureDescription(temperatures.introductionGeneration)}
                </Typography>
              </Paper>

              <Slider
                value={temperatures.introductionGeneration}
                onChange={handleTemperatureChange('introductionGeneration')}
                min={0.1}
                max={1.0}
                step={0.1}
                marks
                valueLabelDisplay="auto"
                sx={{ mt: 3 }}
              />
              
              <Typography variant="caption" color="text.secondary">
                권장값: 0.4 ~ 0.6 (창의적인 작성을 위해)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ResetIcon />}
          onClick={resetToDefaults}
        >
          기본값으로 재설정
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={saveSettings}
          disabled={saving}
        >
          {saving ? '저장 중...' : '설정 저장'}
        </Button>
      </Box>

      {/* Additional Information */}
      <Paper sx={{ mt: 3, p: 2, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Info color="action" />
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Temperature 설정 가이드
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>0.1 - 0.3:</strong> 매우 일관되고 예측 가능한 결과. 사실 기반 분석에 적합
              <br />
              • <strong>0.4 - 0.6:</strong> 균형잡힌 결과. 적절한 창의성과 정확성
              <br />
              • <strong>0.7 - 1.0:</strong> 매우 창의적이지만 일관성이 낮음. 브레인스토밍에 적합
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;