// PomodoroTimer.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, PauseIcon, StopIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useTimer } from './useTimer';
import CustomTaskSelector from './CustomTaskSelector';
import { tasksAtom, fetchTasksAtom, dailyStatsAtom, activeTabAtom, taskShowAddFormAtom } from './atoms';

interface PomodoroTimerProps {
  selectedTaskId?: string;
  onTaskSelect?: (taskId: string) => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ selectedTaskId, onTaskSelect }) => {
  const {
    minutes,
    seconds,
    isActive,
    isPaused,
    isCompleted,
    timerStatus,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    recordInterruption,
    dismissCompletion
  } = useTimer();

  const [tasks] = useAtom(tasksAtom);
  const [, fetchTasks] = useAtom(fetchTasksAtom);
  const [dailyStats] = useAtom(dailyStatsAtom);
  const [, setActiveTab] = useAtom(activeTabAtom);
  const [, setShowAddTask] = useAtom(taskShowAddFormAtom);

  const [localSelectedTask, setLocalSelectedTask] = useState<string | undefined>(selectedTaskId);

  // Sync with external selectedTaskId
  useEffect(() => {
    setLocalSelectedTask(selectedTaskId);
  }, [selectedTaskId]);

  // Load tasks if empty
  useEffect(() => {
    if (tasks.length === 0) {
      fetchTasks();
    }
  }, [tasks.length, fetchTasks]);

  // Handle timer completion
  useEffect(() => {
    if (isCompleted) {
      toast.success('Timer Completed! Take a break.', {
        duration: 5000,
        action: {
          label: 'Dismiss',
          onClick: () => dismissCompletion(),
        },
      });

      // If a focus session just completed, switch to break page
      if (timerStatus.session_type === 'FOCUS') {
        stopTimer();
        setActiveTab('break');
      }
    }
  }, [isCompleted, dismissCompletion, timerStatus.session_type, setActiveTab]);

  // Calculate progress for the circular indicator
  const progress = useMemo(() => {
    const totalSeconds = (timerStatus.duration_minutes || 25) * 60;
    const currentSeconds = minutes * 60 + seconds;
    const elapsed = totalSeconds - currentSeconds;
    return Math.min(100, Math.max(0, (elapsed / totalSeconds) * 100));
  }, [minutes, seconds, timerStatus.duration_minutes]);

  // Calculate stroke dash offset for SVG circle
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  const handleStart = () => {
    startTimer(localSelectedTask, timerStatus.session_type || 'FOCUS');
    toast.success('Timer Started');
  };

  const handlePause = () => {
    pauseTimer();
    toast.info('Timer Paused');
  };

  const handleResume = () => {
    resumeTimer();
    toast.success('Timer Resumed');
  };

  const handleStop = () => {
    stopTimer();
    toast.info('Timer Stopped');
  };

  const handleTaskSelect = (taskId: string) => {
    setLocalSelectedTask(taskId);
    if (onTaskSelect) {
      onTaskSelect(taskId);
    }
  };

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  const getSessionLabel = () => {
    switch (timerStatus.session_type) {
      case 'FOCUS':
        return 'Focus';
      case 'SHORT_BREAK':
        return 'Short Break';
      case 'LONG_BREAK':
        return 'Long Break';
      default:
        return 'Focus';
    }
  };

  const getStatusText = () => {
    if (!isActive && !isPaused) return 'Stay Focused';
    if (isPaused) return 'Paused';
    if (isActive) return 'Focusing...';
    return 'Stay Focused';
  };

  // Calculate daily stats
  const completedPomodoros = dailyStats?.completed_pomodoros || 0;
  const dailyGoal = dailyStats?.daily_goal || 8;
  const totalFocusMinutes = dailyStats?.total_focus_minutes || 0;
  const focusScore = dailyStats?.focus_score || 0;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-8">
      {/* Mode Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={timerStatus.session_type}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50 block w-fit mx-auto"
          >
            {getSessionLabel()}
          </motion.span>
        </AnimatePresence>
        <motion.h2
          key={getStatusText()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-3xl font-bold tracking-tight text-slate-800 dark:text-white"
        >
          {getStatusText()}
        </motion.h2>
      </motion.div>

      {/* Central Timer Ring Area */}
      <div className="relative w-72 h-72 md:w-80 md:h-80 mb-12 group transition-transform duration-500 hover:scale-105">
        {/* SVG Progress Ring */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            className="text-slate-100 dark:text-slate-800"
            cx="50"
            cy="50"
            fill="none"
            r="45"
            stroke="currentColor"
            strokeWidth="4"
          />
          {/* Progress Circle */}
          <motion.circle
            className="text-indigo-600 dark:text-indigo-500 shadow-indigo-500"
            cx="50"
            cy="50"
            fill="none"
            r="45"
            stroke="currentColor"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "linear" }}
            strokeLinecap="round"
            strokeWidth="4"
            style={{ filter: 'drop-shadow(0 0 4px rgba(79, 70, 229, 0.2))' }}
          />
        </svg>

        {/* Timer Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={minutes}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="text-7xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums"
              >
                {formatTime(minutes)}
              </motion.span>
            </AnimatePresence>
            <span className="text-5xl md:text-6xl font-light text-indigo-400/50 mx-1 animate-pulse">:</span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={seconds}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="text-7xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums"
              >
                {formatTime(seconds)}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-10 w-full max-w-md">
        <div className="flex items-center gap-4 w-full">
          {!isActive && !isPaused ? (
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-3 rounded-2xl h-16 bg-indigo-600 text-white text-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40"
            >
              <PlayIcon className="h-6 w-6" />
              <span>Start</span>
            </motion.button>
          ) : (
            <>
              <AnimatePresence mode="wait">
                {isPaused ? (
                  <motion.button
                    key="resume"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleResume}
                    className="flex-1 flex items-center justify-center gap-3 rounded-2xl h-16 bg-indigo-600 text-white text-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30"
                  >
                    <PlayIcon className="h-6 w-6" />
                    <span>Resume</span>
                  </motion.button>
                ) : (
                  <motion.button
                    key="pause"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePause}
                    className="flex-1 flex items-center justify-center gap-3 rounded-2xl h-16 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-lg"
                  >
                    <PauseIcon className="h-6 w-6" />
                    <span>Pause</span>
                  </motion.button>
                )}
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleStop}
                className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-slate-200 dark:border-slate-700 shadow-lg"
                title="Stop Session"
              >
                <StopIcon className="h-6 w-6" />
              </motion.button>
              {!isPaused && (
                <motion.button
                  whileHover={{ scale: 1.1, rotate: -5, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={recordInterruption}
                  className="w-16 h-16 flex items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all border border-amber-100 dark:border-amber-900/30 shadow-sm"
                  title="Record Interruption"
                >
                  <ExclamationTriangleIcon className="h-6 w-6" />
                </motion.button>
              )}
            </>
          )}
        </div>

        {/* Task Selector Dropdown */}
        <div className="w-full">
          <CustomTaskSelector
            tasks={tasks}
            selectedTaskId={localSelectedTask}
            onTaskSelect={handleTaskSelect}
          />
        </div>
      </div>

      {/* Today's Tasks Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-4xl mt-12 bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/50 shadow-sm backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 rounded-full bg-indigo-500"
            ></motion.span>
            Today's Tasks
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {tasks.filter(t => !t.completed).length} active
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab('tasks');
                setShowAddTask(true);
              }}
              className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline"
            >
              + Add Task
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {tasks.filter(t => !t.completed).slice(0, 4).map((task, index) => {
              const taskProgress = task.estimated_pomodoros > 0
                ? Math.min(Math.round((task.actual_pomodoros / task.estimated_pomodoros) * 100), 100)
                : 0;

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 hover:border-indigo-500/30 transition-all group cursor-default"
                >
                  <div className="flex flex-col min-w-0 pr-4">
                    <span className="text-base font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-500 transition-colors">
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-slate-400">
                        {task.actual_pomodoros} / {task.estimated_pomodoros} pomos
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-indigo-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${taskProgress}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-400 w-8 text-right">{taskProgress}%</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {tasks.filter(t => !t.completed).length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 italic">
            <p>No active tasks for today.</p>
            <p className="text-sm">Time to set some new goals!</p>
          </div>
        )}
      </motion.div>

      {/* Footer Stats Grid */}
      <div className="mt-16 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Daily Goal',
            value: completedPomodoros,
            total: dailyGoal,
            type: 'progress'
          },
          {
            label: 'Time Focused',
            value: totalFocusMinutes,
            unit: 'min',
            sub: "Today's total focus"
          },
          {
            label: 'Focus Score',
            value: focusScore,
            unit: '%',
            sub: "Based on interruptions",
            dot: true
          }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + idx * 0.1 }}
            className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50 flex flex-col items-center shadow-sm backdrop-blur-sm"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2">{stat.label}</span>
            <div className="flex items-center gap-2">
              {stat.dot && <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
                {stat.total && <span className="text-slate-400 text-sm">/ {stat.total}</span>}
                {stat.unit && <span className="text-sm font-medium text-slate-400 ml-1">{stat.unit}</span>}
              </div>
            </div>
            {stat.type === 'progress' ? (
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-4 overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((completedPomodoros / dailyGoal) * 100, 100)}%` }}
                  transition={{ duration: 1.5, delay: 0.6 }}
                />
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2 font-medium">{stat.sub}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PomodoroTimer;
