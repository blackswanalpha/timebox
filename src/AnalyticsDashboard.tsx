// AnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { ChartBarIcon, ClockIcon, FlagIcon, CakeIcon, ExclamationTriangleIcon, ListBulletIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
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

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <ChartBarIcon className="h-6 w-6" />
            Today's Analytics
          </div>
        </div>
        <div className="empty-state">
          <ArrowPathIcon className="h-8 w-8 animate-spin" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
            <ChartBarIcon className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Analytics</h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col gap-3 transition-all hover:border-indigo-200 dark:hover:border-indigo-900/50">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 w-10 h-10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ClockIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Focus Time</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">{formatTime(todayStats.totalFocusTime)}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col gap-3 transition-all hover:border-emerald-200 dark:hover:border-emerald-900/50">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FlagIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Sessions</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">{todayStats.completedFocusSessions}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col gap-3 transition-all hover:border-blue-200 dark:hover:border-blue-900/50">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-10 h-10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <CakeIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Breaks</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">{todayStats.completedBreakSessions}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col gap-3 transition-all hover:border-amber-200 dark:hover:border-amber-900/50">
            <div className="bg-amber-100 dark:bg-amber-900/30 w-10 h-10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Distractions</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">{todayStats.interruptionCount}</p>
            </div>
          </div>
        </div>
        
        {/* Breakdown Section */}
        <div className="bg-white dark:bg-slate-800/20 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <ListBulletIcon className="h-4.5 w-4.5 text-slate-400" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Session Breakdown</h3>
          </div>
          
          {sessions.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3 opacity-60">
              <ChartBarIcon className="h-8 w-8" />
              <p className="text-sm font-medium">No sessions to analyze yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sessions.map(session => (
                <div key={session.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      session.session_type === 'FOCUS' ? 'bg-indigo-500 shadow-lg shadow-indigo-500/50' : 
                      session.session_type === 'SHORT_BREAK' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {session.session_type === 'FOCUS' ? 'Focus Session' : 
                       session.session_type === 'SHORT_BREAK' ? 'Short Break' : 'Long Break'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-bold text-slate-400 tabular-nums">
                      {session.duration_seconds ? formatTime(session.duration_seconds) : 'In progress'}
                    </span>
                    {session.interruption_count > 0 && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-md text-[10px] font-black border border-amber-100 dark:border-amber-900/30">
                        <ExclamationTriangleIcon className="h-2.5 w-2.5" />
                        {session.interruption_count}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;