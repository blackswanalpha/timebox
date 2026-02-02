import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  TrashIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import { useStopwatch } from './useStopwatch';
import { toast } from 'sonner';

const StopwatchTimer: React.FC = () => {
  const {
    isRunning,
    formattedTime,
    hours,
    minutes,
    seconds,
    history,
    startStopwatch,
    pauseStopwatch,
    resumeStopwatch,
    resetStopwatch,
    stopAndSaveStopwatch,
    deleteHistoryEntry,
    clearAllHistory
  } = useStopwatch();

  const [showLabelInput, setShowLabelInput] = useState(false);
  const [tempLabel, setTempLabel] = useState('');

  const handleStart = () => {
    startStopwatch();
    toast.success('Stopwatch Started');
  };

  const handlePause = () => {
    pauseStopwatch();
    toast.info('Stopwatch Paused');
  };

  const handleResume = () => {
    resumeStopwatch();
    toast.success('Stopwatch Resumed');
  };

  const handleReset = () => {
    resetStopwatch();
    toast.info('Stopwatch Reset');
  };

  const handleStop = () => {
    if (hours === 0 && minutes === 0 && seconds === 0) {
      toast.error('Cannot save - stopwatch is at 00:00:00');
      return;
    }
    setShowLabelInput(true);
    setTempLabel('');
  };

  const handleSaveWithLabel = () => {
    stopAndSaveStopwatch(tempLabel);
    setShowLabelInput(false);
    setTempLabel('');
    toast.success('Session saved to history');
  };

  const handleCancelSave = () => {
    setShowLabelInput(false);
    setTempLabel('');
  };

  const handleDeleteEntry = (id: string) => {
    deleteHistoryEntry(id);
    toast.success('Entry deleted');
  };

  const handleClearAll = () => {
    if (history.length === 0) return;

    if (confirm('Are you sure you want to clear all stopwatch history?')) {
      clearAllHistory();
      toast.success('All history cleared');
    }
  };

  const formatDuration = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-3xl mx-auto py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50 block w-fit mx-auto"
        >
          Stopwatch
        </motion.span>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-3xl font-bold tracking-tight text-slate-800 dark:text-white"
        >
          {isRunning ? 'Timing...' : 'Ready to Time'}
        </motion.h2>
      </motion.div>

      {/* Timer Display */}
      <div className="relative mb-12">
        <motion.div
          className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums font-mono"
          animate={isRunning ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ repeat: isRunning ? Infinity : 0, duration: 1 }}
        >
          {formattedTime}
        </motion.div>
        <div className="flex justify-center gap-8 mt-4 text-sm font-medium text-slate-400 uppercase tracking-widest">
          <span>Hours</span>
          <span>Minutes</span>
          <span>Seconds</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-6 w-full max-w-md mb-12">
        <div className="flex items-center gap-4 w-full justify-center">
          <AnimatePresence mode="wait">
            {!isRunning && hours === 0 && minutes === 0 && seconds === 0 ? (
              <motion.button
                key="start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                className="flex items-center justify-center gap-3 rounded-2xl h-16 px-8 bg-emerald-600 text-white text-xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/40"
              >
                <PlayIcon className="h-6 w-6" />
                <span>Start</span>
              </motion.button>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  {isRunning ? (
                    <motion.button
                      key="pause"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePause}
                      className="flex items-center justify-center gap-3 rounded-2xl h-16 px-8 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-lg"
                    >
                      <PauseIcon className="h-6 w-6" />
                      <span>Pause</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      key="resume"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleResume}
                      className="flex items-center justify-center gap-3 rounded-2xl h-16 px-8 bg-emerald-600 text-white text-xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/30"
                    >
                      <PlayIcon className="h-6 w-6" />
                      <span>Resume</span>
                    </motion.button>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleStop}
                  className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-slate-200 dark:border-slate-700 shadow-lg"
                  title="Stop & Save"
                >
                  <StopIcon className="h-6 w-6" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: -5, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleReset}
                  className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all border border-slate-200 dark:border-slate-700 shadow-lg"
                  title="Reset"
                >
                  <ArrowPathIcon className="h-6 w-6" />
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Label Input Modal */}
        <AnimatePresence>
          {showLabelInput && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Save Session
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Duration: <span className="font-mono font-bold text-slate-900 dark:text-white">{formattedTime}</span>
              </p>
              <input
                type="text"
                placeholder="Add a label (optional)..."
                value={tempLabel}
                onChange={(e) => setTempLabel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-4"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveWithLabel();
                  if (e.key === 'Escape') handleCancelSave();
                }}
                autoFocus
              />
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveWithLabel}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all"
                >
                  Save
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelSave}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-3xl bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/50 shadow-sm backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 rounded-full bg-emerald-500"
            ></motion.span>
            History
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {history.length} sessions
            </span>
            {history.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearAll}
                className="text-red-500 text-xs font-bold hover:underline"
              >
                Clear All
              </motion.button>
            )}
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
          <AnimatePresence mode="popLayout">
            {history.map((session, index) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono font-bold text-lg text-slate-900 dark:text-white">
                      {formatDuration(session.duration_seconds)}
                    </span>
                    {session.label && (
                      <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                        {session.label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-slate-400 font-medium">
                    {formatDate(session.created_at)}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteEntry(session.id)}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                    title="Delete entry"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <ClockIcon className="w-12 h-12 mb-3 opacity-30" />
            <p className="italic">No stopwatch sessions yet</p>
            <p className="text-sm mt-1">Start the timer to track your time!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StopwatchTimer;
