import React from 'react';
import { ClockIcon, CalendarIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface HeatmapStatsProps {
  peakPerformance: { start: number; end: number } | null;
  mostFocusedDay: string | null;
  flowStateQuality: number;
  mostFocusedDayDuration: number;
}

const HeatmapStats: React.FC<HeatmapStatsProps> = ({
  peakPerformance,
  mostFocusedDay,
  flowStateQuality,
  mostFocusedDayDuration,
}) => {
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    }
    return `${mins}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Peak Performance */}
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-700/50 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <ClockIcon className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-slate-700 dark:text-slate-200">Peak Performance</h4>
        </div>
        {peakPerformance ? (
          <>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {formatHour(peakPerformance.start)} — {formatHour(peakPerformance.end)}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Average high intensity duration: {formatDuration((peakPerformance.end - peakPerformance.start) * 60)}
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-black text-slate-400 dark:text-slate-600">No data</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Complete focus sessions to see peak hours
            </p>
          </>
        )}
      </div>

      {/* Most Focused Day */}
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-emerald-200 dark:hover:border-emerald-700/50 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-slate-700 dark:text-slate-200">Most Focused Day</h4>
        </div>
        {mostFocusedDay ? (
          <>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{mostFocusedDay}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {formatDuration(mostFocusedDayDuration)} of Deep Work sessions
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-black text-slate-400 dark:text-slate-600">No data</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Complete focus sessions across different days
            </p>
          </>
        )}
      </div>

      {/* Flow State Quality */}
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-amber-200 dark:hover:border-amber-700/50 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
            <SparklesIcon className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-slate-700 dark:text-slate-200">Flow State Quality</h4>
        </div>
        <p className="text-2xl font-black text-slate-900 dark:text-white">
          {Math.round(flowStateQuality)}%
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Based on uninterrupted sessions
        </p>
      </div>
    </div>
  );
};

export default HeatmapStats;
