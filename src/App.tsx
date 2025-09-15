import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';
import { AppProvider } from './contexts/AppContext';
import { AnalysisProvider } from './context/AnalysisContext';
import { AuthProvider } from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navigation from './components/layout/Navigation';
import PaperCollector from './components/collectors/PaperCollector';
import PaperList from './components/collectors/PaperList';
import SavedPapers from './components/database/SavedPapers';
import TextAnalyzer from './components/analyzers/TextAnalyzer';
import TrendAnalysis from './components/analyzers/TrendAnalysis';
import ResearchReport from './components/reports/ResearchReport';
import Paperwork from './components/paperwork/Paperwork';
import Settings from './components/settings/Settings';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const CollectionPage: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <PaperCollector />
    <PaperList />
  </Box>
);

const SavedPapersPage: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <SavedPapers />
  </Box>
);

const AnalysisPage: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <TextAnalyzer />
  </Box>
);

const TrendsPage: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <TrendAnalysis />
  </Box>
);

const ReportsPage: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <ResearchReport />
  </Box>
);

const TasksPage: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Paperwork />
  </Box>
);

const SettingsPage: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Settings />
  </Box>
);

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppProvider>
          <AnalysisProvider>
            <Router>
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            minHeight: '100vh'
          }}>
            <Navigation drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                bgcolor: 'background.default',
                p: { xs: 2, sm: 3 },
                mt: { xs: 7, sm: 8 },
                minWidth: 0,
                overflow: 'auto',
                width: '100%'
              }}
            >
              <Container maxWidth="xl">
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <CollectionPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/collection" element={
                    <ProtectedRoute>
                      <CollectionPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/saved" element={
                    <ProtectedRoute>
                      <SavedPapersPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/analysis" element={
                    <ProtectedRoute>
                      <AnalysisPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/trends" element={
                    <ProtectedRoute>
                      <TrendsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <ReportsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/tasks" element={
                    <ProtectedRoute>
                      <TasksPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Container>
            </Box>
          </Box>
            </Router>
          </AnalysisProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
