// AnalyticsDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { ChartBarIcon, ArrowPathIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import { apiService } from './apiService';
import { PomodoroSession } from './types';
import FocusHeatmap from './components/analytics/FocusHeatmap';
import TimePeriodSelector, { TimePeriod } from './components/analytics/TimePeriodSelector';
import HeatmapStats from './components/analytics/HeatmapStats';
import OptimizationInsight from './components/analytics/OptimizationInsight';

// Heatmap data types
interface HeatmapData {
  grid: number[][]; // 7 days x 24 hours, values 0-4
  sessionsByCell: Map<string, PomodoroSession[]>;
  peakHours: { start: number; end: number } | null;
  mostFocusedDay: string | null;
  mostFocusedDayDuration: number;
  flowStateQuality: number;
  lowProductivityHour: number | null;
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AnalyticsDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('7d');
  const [customDateRange, setCustomDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Calculate date range based on selected period
  const getDateRange = (): { start: Date; end: Date } => {
    const end = new Date();
    const start = new Date();

    switch (timePeriod) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          return { start: customDateRange.start, end: customDateRange.end };
        }
        // Default to 7 days if custom dates not set
        start.setDate(end.getDate() - 7);
        break;
    }

    return { start, end };
  };

  // Load sessions for selected date range
  useEffect(() => {
    loadSessions();
  }, [timePeriod, customDateRange]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const { start, end } = getDateRange();
      
      const loadedSessions = await apiService.getSessionsByDateRange(
        'default_user',
        start,
        end,
        'FOCUS' // Only get focus sessions for the heatmap
      );
      
      setSessions(loadedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Transform sessions into heatmap data
  const heatmapData: HeatmapData = useMemo(() => {
    // Initialize 7x24 grid with zeros
    const grid: number[][] = Array(7).fill(null).map(() => Array(24).fill(0));
    const sessionsByCell = new Map<string, PomodoroSession[]>();
    
    // Day totals for calculating most focused day
    const dayTotals: number[] = Array(7).fill(0);
    
    // Hour totals for calculating peak hours
    const hourTotals: number[] = Array(24).fill(0);
    
    // Track interruptions for flow state quality
    let totalSessions = 0;
    let uninterruptedSessions = 0;
    
    // Aggregate sessions into grid
    sessions.forEach((session) => {
      const startTime = new Date(session.start_time);
      const dayOfWeek = startTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
      // Convert to Monday = 0 format
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const hour = startTime.getHours();
      const duration = session.duration_seconds || 0;
      
      // Add to grid (accumulate duration in minutes)
      grid[adjustedDay][hour] += duration / 60;
      
      // Store sessions for this cell
      const key = `${adjustedDay}-${hour}`;
      if (!sessionsByCell.has(key)) {
        sessionsByCell.set(key, []);
      }
      sessionsByCell.get(key)!.push(session);
      
      // Track day totals
      dayTotals[adjustedDay] += duration;
      
      // Track hour totals for peak hours calculation
      hourTotals[hour] += duration;
      
      // Track flow state quality
      totalSessions++;
      if (session.interruption_count === 0) {
        uninterruptedSessions++;
      }
    });
    
    // Normalize grid values to 0-4 scale
    const maxValue = Math.max(...grid.flat());
    if (maxValue > 0) {
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          // Normalize and map to intensity levels 0-4
          const normalized = grid[day][hour] / maxValue;
          if (normalized === 0) {
            grid[day][hour] = 0;
          } else if (normalized < 0.25) {
            grid[day][hour] = 1;
          } else if (normalized < 0.5) {
            grid[day][hour] = 2;
          } else if (normalized < 0.75) {
            grid[day][hour] = 3;
          } else {
            grid[day][hour] = 4;
          }
        }
      }
    }
    
    // Calculate peak hours (consecutive hours with highest total)
    let peakStart = 0;
    let peakEnd = 0;
    let maxConsecutiveSum = 0;
    
    // Try 2-4 hour windows
    for (let windowSize = 2; windowSize <= 4; windowSize++) {
      for (let start = 0; start <= 24 - windowSize; start++) {
        const sum = hourTotals.slice(start, start + windowSize).reduce((a, b) => a + b, 0);
        if (sum > maxConsecutiveSum) {
          maxConsecutiveSum = sum;
          peakStart = start;
          peakEnd = start + windowSize;
        }
      }
    }
    
    const peakHours = maxConsecutiveSum > 0 ? { start: peakStart, end: peakEnd } : null;
    
    // Calculate most focused day
    const maxDayIndex = dayTotals.indexOf(Math.max(...dayTotals));
    const mostFocusedDay = dayTotals[maxDayIndex] > 0 ? dayNames[maxDayIndex] : null;
    
    // Calculate flow state quality (percentage of uninterrupted sessions)
    const flowStateQuality = totalSessions > 0 ? (uninterruptedSessions / totalSessions) * 100 : 0;
    
    // Find low productivity hour (after peak, when activity drops significantly)
    let lowProductivityHour: number | null = null;
    if (peakHours) {
      // Look for significant drop after peak hours
      for (let hour = peakHours.end; hour < 24; hour++) {
        if (hourTotals[hour] < maxConsecutiveSum * 0.3) {
          lowProductivityHour = hour;
          break;
        }
      }
    }
    
    return {
      grid,
      sessionsByCell,
      peakHours,
      mostFocusedDay,
      mostFocusedDayDuration: dayTotals[maxDayIndex],
      flowStateQuality,
      lowProductivityHour,
    };
  }, [sessions]);

  const handleCustomDateChange = (start: Date, end: Date) => {
    setCustomDateRange({ start, end });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Focus Heatmap</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Visualize your deep work patterns</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <ArrowPathIcon className="h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
            <ChartBarIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Focus Heatmap</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Visualize your deep work patterns and peak performance hours across the week
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-slate-700 dark:text-slate-300">
            <ArrowDownTrayIcon className="h-4 w-4" /> Export PDF
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:bg-indigo-700 transition-colors">
            <ShareIcon className="h-4 w-4" /> Share Report
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Time Period Selector */}
          <div className="flex justify-center py-2">
            <TimePeriodSelector
              value={timePeriod}
              onChange={setTimePeriod}
              onCustomDateChange={handleCustomDateChange}
            />
          </div>

          {/* Focus Heatmap */}
          <FocusHeatmap 
            gridData={heatmapData.grid} 
            sessionsByCell={heatmapData.sessionsByCell} 
          />

          {/* Statistics Cards */}
          <HeatmapStats
            peakPerformance={heatmapData.peakHours}
            mostFocusedDay={heatmapData.mostFocusedDay}
            flowStateQuality={heatmapData.flowStateQuality}
            mostFocusedDayDuration={heatmapData.mostFocusedDayDuration}
          />

          {/* Optimization Insight */}
          <OptimizationInsight
            lowProductivityHour={heatmapData.lowProductivityHour}
            hasEnoughData={sessions.length >= 3}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
