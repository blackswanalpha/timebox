// AnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Target, Coffee, AlertTriangle, List, Loader2 } from 'lucide-react';
import { apiService } from './apiService';
import { PomodoroSession } from './types';

const AnalyticsDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [todayStats, setTodayStats] = useState({
    totalFocusTime: 0,
    completedFocusSessions: 0,
    completedBreakSessions: 0,
    interruptionCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load sessions and calculate stats
  useEffect(() => {
    loadAndCalculateStats();
  }, []);

  const loadAndCalculateStats = async () => {
    try {
      setIsLoading(true);
      const loadedSessions = await apiService.getTodaySessions('default_user');
      setSessions(loadedSessions);
      
      // Calculate today's stats
      const stats = loadedSessions.reduce((acc, session) => {
        if (session.session_type === 'FOCUS') {
          acc.totalFocusTime += session.duration_seconds || 0;
          acc.completedFocusSessions += 1;
        } else {
          acc.completedBreakSessions += 1;
        }
        
        acc.interruptionCount += session.interruption_count;
        
        return acc;
      }, {
        totalFocusTime: 0,
        completedFocusSessions: 0,
        completedBreakSessions: 0,
        interruptionCount: 0
      });
      
      setTodayStats(stats);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert seconds to human-readable format
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getSessionBadgeClass = (type: string) => {
    switch (type) {
      case 'FOCUS':
        return 'badge-focus';
      case 'SHORT_BREAK':
        return 'badge-short-break';
      case 'LONG_BREAK':
        return 'badge-long-break';
      default:
        return 'badge-focus';
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <BarChart3 size={24} />
            Today's Analytics
          </div>
        </div>
        <div className="empty-state">
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card analytics-dashboard">
      <div className="card-header">
        <div className="card-title">
          <BarChart3 size={24} />
          Today's Analytics
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon focus">
            <Clock size={20} />
          </div>
          <div className="stat-label">Total Focus Time</div>
          <div className="stat-value">{formatTime(todayStats.totalFocusTime)}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon sessions">
            <Target size={20} />
          </div>
          <div className="stat-label">Focus Sessions</div>
          <div className="stat-value">{todayStats.completedFocusSessions}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon breaks">
            <Coffee size={20} />
          </div>
          <div className="stat-label">Break Sessions</div>
          <div className="stat-value">{todayStats.completedBreakSessions}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon interruptions">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-label">Interruptions</div>
          <div className="stat-value">{todayStats.interruptionCount}</div>
        </div>
      </div>
      
      <div className="sessions-breakdown">
        <div className="breakdown-header">
          <List size={20} />
          Session Breakdown
        </div>
        
        {sessions.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--spacing-xl)' }}>
            <BarChart3 size={32} />
            <p>No sessions recorded today.</p>
          </div>
        ) : (
          <div className="breakdown-list">
            {sessions.map(session => (
              <div key={session.id} className="breakdown-item">
                <div className="breakdown-info">
                  <span className={`badge ${getSessionBadgeClass(session.session_type)}`}>
                    {session.session_type === 'FOCUS' ? 'Focus' : 
                     session.session_type === 'SHORT_BREAK' ? 'Short Break' : 'Long Break'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {session.duration_seconds ? formatTime(session.duration_seconds) : 'In progress'}
                  </span>
                </div>
                
                {session.interruption_count > 0 && (
                  <span className="interruption-tag">
                    <AlertTriangle size={12} />
                    {session.interruption_count}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;