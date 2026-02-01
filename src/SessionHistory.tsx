// SessionHistory.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon as LoaderIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { apiService } from './apiService';
import { PomodoroSession } from './types';
import { format, isToday, isYesterday } from 'date-fns';
import { useAtom } from 'jotai';
import { activeTabAtom } from './atoms';

const SessionHistory: React.FC = () => {
  const [, setActiveTab] = useAtom(activeTabAtom);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const loadedSessions = await apiService.getSessions('default_user');
      setSessions(loadedSessions.sort((a, b) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      ));
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'FOCUS':
        return <SparklesIcon className="h-5 w-5" />;
      case 'SHORT_BREAK':
        return <ClockIcon className="h-5 w-5" />;
      case 'LONG_BREAK':
        return <SparklesIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  const groupSessionsByDate = (sessions: PomodoroSession[]) => {
    const groups: { [key: string]: PomodoroSession[] } = {};
    sessions.forEach(session => {
      const date = new Date(session.start_time);
      const dateKey = format(date, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });
    return groups;
  };

  const formatDateHeader = (dateKey: string) => {
    const date = new Date(dateKey);
    if (isToday(date)) return 'Today, ' + format(date, 'MMMM d');
    if (isYesterday(date)) return 'Yesterday, ' + format(date, 'MMMM d');
    return format(date, 'EEEE, MMMM d');
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900/50 p-12 h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <LoaderIcon className="h-10 w-10 text-indigo-500 mb-4" />
        </motion.div>
        <p className="text-slate-500 font-medium">Loading your productivity history...</p>
      </div>
    );
  }

  const filteredSessions = sessions.filter(session => {
    if (!searchQuery) return true;
    const taskTitle = session.task_title?.toLowerCase() || '';
    const sessionType = session.session_type.toLowerCase();
    return taskTitle.includes(searchQuery.toLowerCase()) ||
      sessionType.includes(searchQuery.toLowerCase());
  });

  const groupedSessions = groupSessionsByDate(filteredSessions);
  const sortedDates = Object.keys(groupedSessions).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#101822] rounded-3xl border border-slate-200 dark:border-[#233348] shadow-sm overflow-hidden font-display">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-[#233348] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#1a2533] border-none rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
            />
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('manual-entry')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Log Session
        </motion.button>
        <motion.button
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={loadSessions}
          className="flex items-center justify-center h-10 w-10 bg-slate-100 dark:bg-[#1a2533] text-slate-500 dark:text-slate-400 rounded-xl transition-all"
          title="Refresh History"
        >
          <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Session History</h1>
            <p className="text-slate-500 dark:text-[#92a9c9] text-lg">Review your past focus and break periods.</p>
          </motion.div>

          {/* Quick Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 mb-10 pb-6 border-b border-slate-100 dark:border-[#233348]"
          >
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium">
              All Sessions <ChevronDownIcon className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-2 bg-slate-100 dark:bg-[#233348] text-slate-700 dark:text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-[#2d415d] transition-colors">
              Work <ChevronDownIcon className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-2 bg-slate-100 dark:bg-[#233348] text-slate-700 dark:text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-[#2d415d] transition-colors">
              Study <ChevronDownIcon className="h-4 w-4" />
            </button>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {sessions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center p-12 text-slate-400 gap-6"
              >
                <div className="bg-slate-50 dark:bg-[#1a2533] p-10 rounded-full">
                  <ClockIcon className="h-16 w-16 opacity-20" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold dark:text-white mb-2">No history found</p>
                  <p>Sessions will appear here once you complete them.</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-12">
                {sortedDates.map((dateKey) => (
                  <motion.section
                    layout
                    key={dateKey}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                      {formatDateHeader(dateKey)}
                    </h2>
                    <div className="space-y-0">
                      <AnimatePresence>
                        {groupedSessions[dateKey].map((session, index) => {
                          const isLast = index === groupedSessions[dateKey].length - 1;
                          const isFocus = session.session_type === 'FOCUS';

                          return (
                            <motion.div
                              layout
                              key={session.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="grid grid-cols-[48px_1fr] gap-x-6"
                            >
                              {/* Timeline Line & Dot */}
                              <div className="flex flex-col items-center">
                                <motion.div
                                  whileHover={{ scale: 1.2 }}
                                  className={`mt-2 flex items-center justify-center h-9 w-9 rounded-full shrink-0 z-10 transition-colors ${isFocus
                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'bg-slate-100 dark:bg-[#233348] text-slate-400 dark:text-[#92a9c9]'
                                    }`}>
                                  {getSessionIcon(session.session_type)}
                                </motion.div>
                                {!isLast && (
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: "100%" }}
                                    className="w-[2px] bg-slate-200 dark:bg-[#324867] flex-1 my-1"
                                  ></motion.div>
                                )}
                              </div>

                              {/* Session Card */}
                              <motion.div
                                whileHover={{ x: 5 }}
                                className={`flex flex-col py-4 px-5 rounded-2xl mb-6 transition-all border ${isFocus
                                  ? 'bg-slate-50 dark:bg-[#1a2533] border-slate-200 dark:border-[#233348] hover:border-indigo-300 dark:hover:border-indigo-500/30 shadow-sm'
                                  : 'border-transparent'
                                  }`}>
                                <div className="flex justify-between items-start mb-1">
                                  <h3 className={`text-base font-semibold ${isFocus ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-white/80'}`}>
                                    {session.session_type === 'FOCUS' ? 'Focus Session' :
                                      session.session_type === 'SHORT_BREAK' ? 'Short Break' : 'Long Break'}
                                    {session.duration_seconds && ` | ${Math.round(session.duration_seconds / 60)} min`}
                                    {session.task_title && ` | ${session.task_title}`}
                                  </h3>
                                  {isFocus && (
                                    <motion.span
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className="bg-indigo-500/10 text-indigo-500 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider"
                                    >
                                      Productivity
                                    </motion.span>
                                  )}
                                </div>

                                <div className="flex items-center gap-4">
                                  <p className="text-slate-500 dark:text-[#92a9c9] text-sm">
                                    {formatTime(session.start_time)}
                                    {session.end_time && ` - ${formatTime(session.end_time)}`}
                                  </p>
                                  {session.interruption_count > 0 && (
                                    <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                      <ExclamationTriangleIcon className="h-3 w-3" />
                                      {session.interruption_count} {session.interruption_count === 1 ? 'break' : 'breaks'}
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </motion.section>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SessionHistory;