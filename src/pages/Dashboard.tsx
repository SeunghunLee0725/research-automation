import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Article,
  TrendingUp,
  Assignment,
  Description,
  PlayArrow,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { papers, tasks } = useApp();

  const stats = [
    {
      title: 'Papers Collected',
      value: papers.length,
      icon: <Article />,
      color: '#1976d2',
      path: '/collection',
    },
    {
      title: 'Active Tasks',
      value: tasks.filter(t => t.status === 'in_progress').length,
      icon: <Assignment />,
      color: '#ff9800',
      path: '/tasks',
    },
    {
      title: 'Reports Generated',
      value: 0,
      icon: <Description />,
      color: '#4caf50',
      path: '/reports',
    },
    {
      title: 'Trends Identified',
      value: 0,
      icon: <TrendingUp />,
      color: '#9c27b0',
      path: '/trends',
    },
  ];

  const recentActivities = [
    { action: 'System initialized', time: new Date(), type: 'info' },
    { action: 'Ready for paper collection', time: new Date(), type: 'success' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Welcome to the Plasma Research Automation System
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
              onClick={() => navigate(stat.path)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: `${stat.color}20`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h4" component="div">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={() => navigate('/collection')}
                  fullWidth
                >
                  Start Paper Collection
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  onClick={() => navigate('/trends')}
                  fullWidth
                >
                  View Trends
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/tasks')}
                  fullWidth
                >
                  Manage Tasks
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  fullWidth
                >
                  Sync Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">API Status</Typography>
                  <Typography variant="body2" color="success.main">
                    Active
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={100} color="success" />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Database</Typography>
                  <Typography variant="body2" color="success.main">
                    Connected
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={100} color="success" />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Scheduler</Typography>
                  <Typography variant="body2" color="warning.main">
                    Idle
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={0} color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentActivities.map((activity, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 1.5,
                      backgroundColor: activity.type === 'success' ? 'success.50' : 'grey.50',
                    }}
                  >
                    <Typography variant="body2">
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {format(activity.time, 'HH:mm:ss')}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Research Keywords */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Research Keywords
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['atmospheric plasma', 'cold plasma', 'DBD', 'plasma jet', 'surface treatment', 
                  'plasma coating', 'sterilization', 'plasma polymerization'].map((keyword) => (
                  <Paper
                    key={keyword}
                    sx={{
                      px: 2,
                      py: 1,
                      backgroundColor: 'primary.50',
                      color: 'primary.main',
                    }}
                  >
                    <Typography variant="body2">{keyword}</Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;