import React from 'react';
import { PomodoroSession } from '../../types';

interface HeatmapTooltipProps {
  isVisible: boolean;
  position: { x: number; y: number };
  dayIndex: number;
  hour: number;
  sessions: PomodoroSession[];
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HeatmapTooltip: React.FC<HeatmapTooltipProps> = ({
  isVisible,
  position,
  dayIndex,
  hour,
  sessions,
}) => {
  if (!isVisible || sessions.length === 0) return null;

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const totalDuration = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
  const totalInterruptions = sessions.reduce((acc, s) => acc + s.interruption_count, 0);
  const uniqueTasks = [...new Set(sessions.filter(s => s.task_title).map(s => s.task_title))];

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%) translateY(-12px)',
      }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 min-w-[240px] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {dayNames[dayIndex]}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {formatTime(hour)}
            </span>
          </div>
          <span className="text-xs font-bold px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Focus Time</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {formatDuration(totalDuration)}
            </span>
          </div>
          {totalInterruptions > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Interruptions</span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {totalInterruptions}
              </span>
            </div>
          )}
        </div>

        {/* Tasks */}
        {uniqueTasks.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Tasks</span>
            <div className="flex flex-wrap gap-1">
              {uniqueTasks.slice(0, 3).map((task, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md truncate max-w-[200px]"
                  title={task}
                >
                  {task}
                </span>
              ))}
              {uniqueTasks.length > 3 && (
                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md">
                  +{uniqueTasks.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Arrow */}
        <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700 rotate-45" />
      </div>
    </div>
  );
};

export default HeatmapTooltip;
