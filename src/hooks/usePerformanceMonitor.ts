import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  pageLoadTime?: number;
  renderTime?: number;
  apiResponseTime?: number;
  bundleSize?: number;
}

export const usePerformanceMonitor = (pageName?: string) => {
  const startTime = Date.now();

  // Measure page load performance
  useEffect(() => {
    const measurePageLoad = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        const metrics: PerformanceMetrics = {
          pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
          renderTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        };

        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] ${pageName || 'Page'} metrics:`, metrics);
        }

        // Store metrics for analysis
        if (typeof window !== 'undefined') {
          const existingMetrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
          existingMetrics.push({
            page: pageName || 'unknown',
            timestamp: Date.now(),
            ...metrics,
          });
          
          // Keep only last 50 measurements
          if (existingMetrics.length > 50) {
            existingMetrics.splice(0, existingMetrics.length - 50);
          }
          
          localStorage.setItem('performance_metrics', JSON.stringify(existingMetrics));
        }
      }
    };

    // Measure after page is fully loaded
    if (document.readyState === 'complete') {
      measurePageLoad();
    } else {
      window.addEventListener('load', measurePageLoad);
      return () => window.removeEventListener('load', measurePageLoad);
    }
  }, [pageName]);

  // Function to measure API response times
  const measureApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint?: string
  ): Promise<T> => {
    const start = Date.now();
    
    try {
      const result = await apiCall();
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] API ${endpoint || 'call'} took ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.error(`[Performance] API ${endpoint || 'call'} failed after ${duration}ms`, error);
      }
      throw error;
    }
  }, []);

  // Function to get performance summary
  const getPerformanceSummary = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
    
    if (metrics.length === 0) return null;

    const summary = {
      totalMeasurements: metrics.length,
      averagePageLoadTime: metrics.reduce((acc: number, m: any) => acc + (m.pageLoadTime || 0), 0) / metrics.length,
      averageRenderTime: metrics.reduce((acc: number, m: any) => acc + (m.renderTime || 0), 0) / metrics.length,
      pages: [...new Set(metrics.map((m: any) => m.page))],
    };

    return summary;
  }, []);

  return {
    measureApiCall,
    getPerformanceSummary,
    startTime,
  };
};