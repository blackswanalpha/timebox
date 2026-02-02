import React, { useState } from 'react';
import { PomodoroSession } from '../../types';
import HeatmapTooltip from './HeatmapTooltip';

interface FocusHeatmapProps {
  gridData: number[][];
  sessionsByCell: Map<string, PomodoroSession[]>;
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getIntensityClass = (intensity: number, isDark: boolean): string => {
  const baseClasses = 'rounded-sm transition-all duration-200 cursor-pointer hover:scale-110 hover:shadow-md';
  
  switch (intensity) {
    case 0:
      return `${baseClasses} ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`;
    case 1:
      return `${baseClasses} bg-indigo-500/20`;
    case 2:
      return `${baseClasses} bg-indigo-500/40`;
    case 3:
      return `${baseClasses} bg-indigo-500/70`;
    case 4:
      return `${baseClasses} bg-indigo-600 shadow-lg shadow-indigo-500/30`;
    default:
      return `${baseClasses} ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`;
  }
};

const FocusHeatmap: React.FC<FocusHeatmapProps> = ({ gridData, sessionsByCell }) => {
  const [tooltip, setTooltip] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
    dayIndex: number;
    hour: number;
    sessions: PomodoroSession[];
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
    dayIndex: 0,
    hour: 0,
    sessions: [],
  });

  const handleCellEnter = (
    e: React.MouseEvent,
    dayIndex: number,
    hour: number,
    intensity: number
  ) => {
    if (intensity === 0) return;
    
    const key = `${dayIndex}-${hour}`;
    const sessions = sessionsByCell.get(key) || [];
    
    if (sessions.length === 0) return;

    setTooltip({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY },
      dayIndex,
      hour,
      sessions,
    });
  };

  const handleCellMove = (e: React.MouseEvent) => {
    if (!tooltip.isVisible) return;
    
    setTooltip(prev => ({
      ...prev,
      position: { x: e.clientX, y: e.clientY },
    }));
  };

  const handleCellLeave = () => {
    setTooltip(prev => ({
      ...prev,
      isVisible: false,
    }));
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800/50 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Legend */}
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">
              Productivity Intensity Grid
            </h3>
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span>Less Focus</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-sm bg-slate-200 dark:bg-slate-800" />
                <div className="w-4 h-4 rounded-sm bg-indigo-500/20" />
                <div className="w-4 h-4 rounded-sm bg-indigo-500/40" />
                <div className="w-4 h-4 rounded-sm bg-indigo-500/70" />
                <div className="w-4 h-4 rounded-sm bg-indigo-600" />
              </div>
              <span>More Focus</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="grid grid-cols-[60px_1fr] gap-4">
            {/* Day Labels */}
            <div className="flex flex-col justify-between py-2 text-xs font-bold text-slate-400 dark:text-slate-500">
              {dayNames.map((day) => (
                <div key={day} className="h-8 flex items-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Heatmap Rows */}
            <div className="grid grid-rows-7 gap-2">
              {gridData.map((row, dayIndex) => (
                <div key={dayIndex} className="grid grid-cols-24 gap-1 h-8">
                  {row.map((intensity, hour) => (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className={getIntensityClass(intensity, false)}
                      onMouseEnter={(e) => handleCellEnter(e, dayIndex, hour, intensity)}
                      onMouseMove={handleCellMove}
                      onMouseLeave={handleCellLeave}
                      title={`${dayNames[dayIndex]} ${hour}:00 - ${intensity} intensity`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Hour Labels */}
          <div className="grid grid-cols-[60px_1fr] gap-4 mt-2">
            <div />
            <div className="grid grid-cols-24 gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
              <div className="col-span-3">12 AM</div>
              <div className="col-span-3">3 AM</div>
              <div className="col-span-3">6 AM</div>
              <div className="col-span-3">9 AM</div>
              <div className="col-span-3">12 PM</div>
              <div className="col-span-3">3 PM</div>
              <div className="col-span-3">6 PM</div>
              <div className="col-span-3">9 PM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <HeatmapTooltip {...tooltip} />
    </>
  );
};

export default FocusHeatmap;
