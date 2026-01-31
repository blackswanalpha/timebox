// SessionHistory.tsx
import React, { useState, useEffect } from 'react';
import { History, Clock, AlertTriangle, Target, Loader2 } from 'lucide-react';
import { apiService } from './apiService';
import { PomodoroSession } from './types';

const SessionHistory: React.FC = () => {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const loadedSessions = await apiService.getTodaySessions('default_user');
      setSessions(loadedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'FOCUS':
        return <Target size={14} />;
      case 'SHORT_BREAK':
        return <Clock size={14} />;
      case 'LONG_BREAK':
        return <Clock size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <History size={24} />
            Today's Sessions
          </div>
        </div>
        <div className="empty-state">
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Loading session history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card session-history">
      <div className="card-header">
        <div className="card-title">
          <History size={24} />
          Today's Sessions
        </div>
      </div>
      
      {sessions.length === 0 ? (
        <div className="empty-state">
          <History size={48} />
          <p>No sessions recorded today.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>
            Start a timer to begin tracking your productivity!
          </p>
        </div>
      ) : (
        <div className="history-list">
          {sessions.map(session => (
            <div key={session.id} className="history-item">
              <div className="history-timeline">
                <div className={`timeline-dot ${session.session_type.toLowerCase()}`}></div>
              </div>
              
              <div className="history-content">
                <div className="history-header">
                  <span className={`badge badge-${session.session_type.toLowerCase()}`}>
                    {getSessionIcon(session.session_type)}
                    {session.session_type === 'FOCUS' ? 'Focus' : 
                     session.session_type === 'SHORT_BREAK' ? 'Short Break' : 'Long Break'}
                  </span>
                  <span className="history-time">
                    {formatTime(session.start_time)}
                    {session.end_time && ` - ${formatTime(session.end_time)}`}
                  </span>
                </div>
                
                <div className="history-details">
                  {session.duration_seconds && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      {formatDuration(session.duration_seconds)}
                    </span>
                  )}
                  
                  {session.interrupted && session.interruption_count > 0 && (
                    <span className="interruption-tag">
                      <AlertTriangle size={12} />
                      {session.interruption_count} interruption{session.interruption_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;