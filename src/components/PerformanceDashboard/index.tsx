import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
} from '@mui/material';
import { ExpandMore, ExpandLess, Speed, Storage, Timer } from '@mui/icons-material';
import { apiCache } from '@/utils/apiCache';

interface PerformanceMetrics {
  page: string;
  timestamp: number;
  pageLoadTime?: number;
  renderTime?: number;
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    // Load performance metrics from localStorage
    const loadMetrics = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('performance_metrics');
        if (stored) {
          setMetrics(JSON.parse(stored));
        }
        setCacheStats(apiCache.getStats());
      }
    };

    loadMetrics();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const averageLoadTime = metrics.length > 0
    ? metrics.reduce((acc, m) => acc + (m.pageLoadTime || 0), 0) / metrics.length
    : 0;

  const averageRenderTime = metrics.length > 0
    ? metrics.reduce((acc, m) => acc + (m.renderTime || 0), 0) / metrics.length
    : 0;

  const recentMetrics = metrics.slice(-5).reverse();

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      <Card sx={{ minWidth: 300 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" component="div">
              Performance Monitor
            </Typography>
            <IconButton onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          
          <Collapse in={expanded}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Speed color="primary" />
                  <Typography variant="h6">
                    {averageLoadTime.toFixed(0)}ms
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Avg Load
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Timer color="secondary" />
                  <Typography variant="h6">
                    {averageRenderTime.toFixed(0)}ms
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Avg Render
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Storage color="success" />
                  <Typography variant="h6">
                    {cacheStats?.size || 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Cache Size
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Recent Page Loads:
            </Typography>
            
            <List dense>
              {recentMetrics.map((metric, index) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">
                          {metric.page}
                        </Typography>
                        <Box>
                          <Chip
                            size="small"
                            label={`${(metric.pageLoadTime || 0).toFixed(0)}ms`}
                            color={
                              (metric.pageLoadTime || 0) < 1000 ? 'success' :
                              (metric.pageLoadTime || 0) < 3000 ? 'warning' : 'error'
                            }
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      </Box>
                    }
                    secondary={new Date(metric.timestamp).toLocaleTimeString()}
                  />
                </ListItem>
              ))}
            </List>

            {cacheStats && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  API Cache:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Entries: {cacheStats.size} | Memory: {(cacheStats.memoryUsage / 1024).toFixed(1)}KB
                </Typography>
              </>
            )}
          </Collapse>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PerformanceDashboard;